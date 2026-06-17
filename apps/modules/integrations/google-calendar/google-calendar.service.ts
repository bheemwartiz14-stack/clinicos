import { google } from "googleapis";
import { db, users } from "@mediclinic/db";
import { eq } from "drizzle-orm";
import {
  getGoogleOAuthClient,
  generateAuthUrl,
  exchangeCodeForTokens,
} from "./google-calendar.oauth";
import { GoogleCalendarRepository } from "./google-calendar.repository";
import type {
  CreateGoogleEventInput,
  UpdateGoogleEventInput,
  CalendarEventResponse,
  FreeBusyResult,
} from "./google-calendar.type";

class GoogleCalendarService {
  async generateAuthUrl(userId: string): Promise<string> {
    if (!userId) throw new Error("userId is required");

    const oauth2Client = getGoogleOAuthClient();
    return generateAuthUrl(oauth2Client, userId);
  }

  async handleCallback(code: string, state: string): Promise<{ success: boolean }> {
    try {
      const { userId } = await this.exchangeCodeAndSaveTokens(code, state);
      await this.createCalendarAndSaveId(userId);
      return { success: true };
    } catch (err) {
      console.error("handleCallback ERROR:", err);
      throw err;
    }
  }

  async exchangeCodeAndSaveTokens(
    code: string,
    state: string
  ): Promise<{ userId: string }> {
    try {
      if (!code || !state) {
        throw new Error("Missing OAuth code or state");
      }

      const oauth2Client = getGoogleOAuthClient();
      const tokens = await exchangeCodeForTokens(oauth2Client, code);

      if (!tokens.access_token) {
        throw new Error("Google did not return access_token");
      }

      let userId: string;

      try {
        const parsed = JSON.parse(state);
        if (!parsed?.userId) throw new Error("Invalid OAuth state");
        userId = parsed.userId;
      } catch {
        throw new Error("OAuth state parsing failed");
      }

      await GoogleCalendarRepository.upsertConnection({
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        expiryDate: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
        scope: tokens.scope ?? null,
      });

      return { userId };
    } catch (err) {
      console.error("exchangeCodeAndSaveTokens ERROR:", err);
      throw err;
    }
  }

  async createCalendarAndSaveId(userId: string): Promise<void> {
    try {
      if (!userId) throw new Error("userId is required");

      const conn = await GoogleCalendarRepository.getByUserId(userId);
      if (!conn?.accessToken) {
        throw new Error("Google Calendar not connected");
      }

      const oauth2Client = getGoogleOAuthClient();
      oauth2Client.setCredentials({
        access_token: conn.accessToken,
        refresh_token: conn.refreshToken ?? undefined,
        expiry_date: conn.expiryDate?.getTime() ?? undefined,
      });

      // SAFE DB QUERY (FIXED)
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
        .then((r) => r[0]);

      const doctorName =
        [user?.firstName, user?.lastName]
          .filter(Boolean)
          .join(" ")
          .trim() || "Doctor";

      const calendarName = `Clinicos (Dr. ${doctorName}) Booking`;

      const calendar = google.calendar({
        version: "v3",
        auth: oauth2Client,
      });

      let calendarResponse;

      try {
        calendarResponse = await calendar.calendars.insert({
          requestBody: {
            summary: calendarName,
            description: `Appointment management calendar for Dr. ${doctorName} - Clinicos`,
            timeZone: "UTC",
          },
        });
      } catch (err) {
        console.error("Google calendar insert failed:", err);
        throw err;
      }

      const calendarId = calendarResponse.data.id;

      if (!calendarId) {
        throw new Error("Failed to create Google Calendar");
      }

      await GoogleCalendarRepository.updateCalendarId(userId, calendarId);
    } catch (err) {
      console.error("createCalendarAndSaveId ERROR:", err);
      throw err;
    }
  }

  private async getAuthenticatedClient(userId: string) {
    try {
      const conn = await GoogleCalendarRepository.getByUserId(userId);
      if (!conn?.accessToken) return null;

      const oauth2Client = getGoogleOAuthClient();
      oauth2Client.setCredentials({
        access_token: conn.accessToken,
        refresh_token: conn.refreshToken ?? undefined,
        expiry_date: conn.expiryDate?.getTime() ?? undefined,
      });

      oauth2Client.on("tokens", async (newTokens) => {
        try {
          const shouldUpdate =
            newTokens.access_token ||
            newTokens.refresh_token ||
            newTokens.expiry_date;

          if (!shouldUpdate) return;

          await GoogleCalendarRepository.updateTokens(
            userId,
            newTokens.access_token ?? conn.accessToken!,
            newTokens.refresh_token ?? conn.refreshToken,
            newTokens.expiry_date
              ? new Date(newTokens.expiry_date)
              : conn.expiryDate
          );
        } catch (err) {
          console.error("Token update failed:", err);
        }
      });

      return {
        client: oauth2Client,
        calendarId: conn.calendarId ?? "primary",
      };
    } catch (err) {
      console.error("getAuthenticatedClient ERROR:", err);
      return null;
    }
  }

  async createCalendarEvent(
    userId: string,
    input: CreateGoogleEventInput
  ): Promise<CalendarEventResponse> {
    const result = await this.getAuthenticatedClient(userId);
    if (!result) throw new Error("Google Calendar not connected");

    const { client: auth, calendarId } = result;

    const calendar = google.calendar({ version: "v3", auth });

    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: input.summary,
        description: input.description,
        start: input.start,
        end: input.end,
        attendees: input.attendees,
        conferenceData: input.conferenceData,
      },
      conferenceDataVersion: input.conferenceDataVersion,
    });

    return {
      id: response.data.id!,
      hangoutLink: response.data.hangoutLink ?? null,
      htmlLink: response.data.htmlLink ?? null,
    };
  }

  async updateCalendarEvent(
    userId: string,
    input: UpdateGoogleEventInput
  ): Promise<void> {
    const result = await this.getAuthenticatedClient(userId);
    if (!result) throw new Error("Google Calendar not connected");

    const { client: auth, calendarId } = result;
    const calendar = google.calendar({ version: "v3", auth });

    const body: Record<string, unknown> = {};

    if (input.summary) body.summary = input.summary;
    if (input.description !== undefined) body.description = input.description;
    if (input.start) body.start = input.start;
    if (input.end) body.end = input.end;
    if (input.attendees) body.attendees = input.attendees;

    await calendar.events.update({
      calendarId,
      eventId: input.eventId,
      requestBody: body,
    });
  }

  async deleteCalendarEvent(userId: string, eventId: string): Promise<void> {
    const result = await this.getAuthenticatedClient(userId);
    if (!result) throw new Error("Google Calendar not connected");

    const { client: auth, calendarId } = result;
    const calendar = google.calendar({ version: "v3", auth });

    await calendar.events.delete({
      calendarId,
      eventId,
    });
  }

  async checkAvailability(
    userId: string,
    timeMin: string,
    timeMax: string
  ): Promise<FreeBusyResult> {
    const result = await this.getAuthenticatedClient(userId);
    if (!result) throw new Error("Google Calendar not connected");

    const { client: auth, calendarId } = result;

    const calendar = google.calendar({ version: "v3", auth });

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: calendarId }],
      },
    });

    const busy =
      (response.data.calendars?.[calendarId]?.busy ?? []).map((b) => ({
        start: b.start!,
        end: b.end!,
      })) || [];

    return { busy };
  }

  async verifyConnection(
    userId: string
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const conn = await GoogleCalendarRepository.getByUserId(userId);

      if (!conn?.accessToken || !conn?.refreshToken) {
        return { valid: false, error: "No tokens found" };
      }

      const oauth2Client = getGoogleOAuthClient();
      oauth2Client.setCredentials({
        access_token: conn.accessToken,
        refresh_token: conn.refreshToken,
        expiry_date: conn.expiryDate?.getTime() ?? undefined,
      });

      const calendar = google.calendar({
        version: "v3",
        auth: oauth2Client,
      });

      await calendar.calendarList.list({ maxResults: 1 });

      return { valid: true };
    } catch (err: any) {
      console.error("verifyConnection ERROR:", err);

      const isAuthError =
        err?.response?.status === 401 ||
        err?.response?.status === 403 ||
        err?.message?.includes("invalid_grant") ||
        err?.message?.includes("invalid_token") ||
        err?.message?.includes("Token has expired");

      if (isAuthError) {
        await GoogleCalendarRepository.disconnect(userId);
        return {
          valid: false,
          error:
            "Refresh token expired. Please reconnect Google Calendar.",
        };
      }

      throw err;
    }
  }

  async disconnect(userId: string): Promise<void> {
    try {
      const result = await this.getAuthenticatedClient(userId);

      if (result) {
        try {
          await result.client.revokeCredentials();
        } catch (err) {
          console.error("Token revoke failed:", err);
        }
      }

      await GoogleCalendarRepository.delete(userId);
    } catch (err) {
      console.error("disconnect ERROR:", err);
      throw err;
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();