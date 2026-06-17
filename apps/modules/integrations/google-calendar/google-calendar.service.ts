import { google } from "googleapis";
import { db, users } from "@mediclinic/db";
import { eq } from "drizzle-orm";
import { getGoogleOAuthClient, generateAuthUrl, exchangeCodeForTokens } from "./google-calendar.oauth";
import { GoogleCalendarRepository } from "./google-calendar.repository";
import type {
  CreateGoogleEventInput,
  UpdateGoogleEventInput,
  CalendarEventResponse,
  FreeBusyResult,
} from "./google-calendar.type";

class GoogleCalendarService {
  async generateAuthUrl(userId: string): Promise<string> {
    const oauth2Client = getGoogleOAuthClient();
    return generateAuthUrl(oauth2Client, userId);
  }

  async handleCallback(code: string, state: string): Promise<{ success: boolean }> {
    const { userId } = await this.exchangeCodeAndSaveTokens(code, state);
    await this.createCalendarAndSaveId(userId);
    return { success: true };
  }

  async exchangeCodeAndSaveTokens(code: string, state: string): Promise<{ userId: string }> {
    const oauth2Client = getGoogleOAuthClient();
    const tokens = await exchangeCodeForTokens(oauth2Client, code);
    const { userId } = JSON.parse(state);

    await GoogleCalendarRepository.upsertConnection({
      userId,
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token ?? null,
      expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      scope: tokens.scope ?? null,
    });

    return { userId };
  }

  async createCalendarAndSaveId(userId: string): Promise<void> {
    const conn = await GoogleCalendarRepository.getByUserId(userId);
    if (!conn?.accessToken) throw new Error("Google Calendar not connected");

    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({
      access_token: conn.accessToken,
      refresh_token: conn.refreshToken ?? undefined,
      expiry_date: conn.expiryDate?.getTime() ?? undefined,
    });

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    const doctorName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "Doctor";
    const calendarName = `Clinicos (Dr. ${doctorName}) Booking`;

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const calendarResponse = await calendar.calendars.insert({
      requestBody: {
        summary: calendarName,
        description: `Appointment management calendar for Dr. ${doctorName} - Clinicos`,
        timeZone: "UTC",
      },
    });

    const calendarId = calendarResponse.data.id!;
    await GoogleCalendarRepository.updateCalendarId(userId, calendarId);
  }

  private async getAuthenticatedClient(userId: string) {
    const conn = await GoogleCalendarRepository.getByUserId(userId);
    if (!conn?.accessToken) return null;

    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({
      access_token: conn.accessToken,
      refresh_token: conn.refreshToken ?? undefined,
      expiry_date: conn.expiryDate?.getTime() ?? undefined,
    });

    oauth2Client.on("tokens", async (newTokens) => {
      const shouldUpdate =
        newTokens.access_token || newTokens.refresh_token || newTokens.expiry_date;
      if (!shouldUpdate) return;

      await GoogleCalendarRepository.updateTokens(
        userId,
        newTokens.access_token ?? conn.accessToken!,
        newTokens.refresh_token ?? conn.refreshToken,
        newTokens.expiry_date ? new Date(newTokens.expiry_date) : conn.expiryDate,
      );
    });

    return { client: oauth2Client, calendarId: conn.calendarId ?? "primary" };
  }

  async createCalendarEvent(userId: string, input: CreateGoogleEventInput): Promise<CalendarEventResponse> {
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

  async updateCalendarEvent(userId: string, input: UpdateGoogleEventInput): Promise<void> {
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
    await calendar.events.delete({ calendarId, eventId });
  }

  async checkAvailability(userId: string, timeMin: string, timeMax: string): Promise<FreeBusyResult> {
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

    const busy = (response.data.calendars?.[calendarId]?.busy ?? []).map((b) => ({
      start: b.start!,
      end: b.end!,
    }));

    return { busy };
  }

  async verifyConnection(userId: string): Promise<{ valid: boolean; error?: string }> {
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

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });
      await calendar.calendarList.list({ maxResults: 1 });

      return { valid: true };
    } catch (err: unknown) {
      const apiErr = err as { response?: { status?: number }; message?: string };
      const isAuthError =
        apiErr?.response?.status === 401 ||
        apiErr?.response?.status === 403 ||
        apiErr?.message?.includes("invalid_grant") ||
        apiErr?.message?.includes("invalid_token") ||
        apiErr?.message?.includes("Token has expired") ||
        apiErr?.message?.includes("No refresh token");

      if (isAuthError) {
        await GoogleCalendarRepository.disconnect(userId);
        return { valid: false, error: "Refresh token expired. Please reconnect Google Calendar." };
      }

      throw err;
    }
  }

  async disconnect(userId: string): Promise<void> {
    const result = await this.getAuthenticatedClient(userId);
    if (result) {
      try {
        await result.client.revokeCredentials();
      } catch {
        // Token may already be invalid; proceed with local cleanup
      }
    }
    await GoogleCalendarRepository.delete(userId);
  }
}

export const googleCalendarService = new GoogleCalendarService();
