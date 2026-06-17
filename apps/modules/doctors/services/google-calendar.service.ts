import { googleCalendarService } from "@modules/integrations/google-calendar/google-calendar.service";
import { getGoogleOAuthClient } from "@modules/integrations/google-calendar/google-calendar.oauth";
import { GoogleCalendarRepository } from "@modules/integrations/google-calendar/google-calendar.repository";
import { google } from "googleapis";
import type { CalendarEventResponse, FreeBusyResult } from "@modules/integrations/google-calendar/google-calendar.type";

export const doctorCalendarService = {
  getAuthUrl(doctorId: string): string {
    return googleCalendarService.generateAuthUrl(doctorId) as unknown as string;
  },

  async handleCallback(code: string): Promise<{ tokens: { access_token: string; refresh_token?: string | null; expiry_date?: number | null } }> {
    const oauth2Client = getGoogleOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    return { tokens: { access_token: tokens.access_token!, refresh_token: tokens.refresh_token, expiry_date: tokens.expiry_date ?? null } };
  },

  async createEvent(params: {
    accessToken: string;
    refreshToken?: string;
    summary: string;
    description?: string;
    startTime: string;
    endTime: string;
    timeZone?: string;
    attendees?: { email: string }[];
    addMeetLink?: boolean;
  }): Promise<CalendarEventResponse> {
    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({
      access_token: params.accessToken,
      refresh_token: params.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event: Record<string, unknown> = {
      summary: params.summary,
      description: params.description,
      start: { dateTime: params.startTime, timeZone: params.timeZone ?? "UTC" },
      end: { dateTime: params.endTime, timeZone: params.timeZone ?? "UTC" },
      attendees: params.attendees,
    };

    if (params.addMeetLink) {
      event.conferenceData = {
        createRequest: { requestId: crypto.randomUUID() },
      };
    }

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: params.addMeetLink ? 1 : undefined,
    });

    return {
      id: response.data.id!,
      hangoutLink: response.data.hangoutLink ?? null,
      htmlLink: response.data.htmlLink ?? null,
    };
  },

  async updateEvent(params: {
    accessToken: string;
    refreshToken?: string;
    eventId: string;
    summary?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    timeZone?: string;
  }): Promise<void> {
    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({
      access_token: params.accessToken,
      refresh_token: params.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const body: Record<string, unknown> = {};

    if (params.summary) body.summary = params.summary;
    if (params.description) body.description = params.description;
    if (params.startTime) body.start = { dateTime: params.startTime, timeZone: params.timeZone ?? "UTC" };
    if (params.endTime) body.end = { dateTime: params.endTime, timeZone: params.timeZone ?? "UTC" };

    await calendar.events.update({
      calendarId: "primary",
      eventId: params.eventId,
      requestBody: body,
    });
  },

  async deleteEvent(params: {
    accessToken: string;
    refreshToken?: string;
    eventId: string;
  }): Promise<void> {
    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({
      access_token: params.accessToken,
      refresh_token: params.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    await calendar.events.delete({ calendarId: "primary", eventId: params.eventId });
  },

  async checkAvailability(params: {
    accessToken: string;
    refreshToken?: string;
    timeMin: string;
    timeMax: string;
  }): Promise<FreeBusyResult> {
    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({
      access_token: params.accessToken,
      refresh_token: params.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: params.timeMin,
        timeMax: params.timeMax,
        items: [{ id: "primary" }],
      },
    });

    const busy = (response.data.calendars?.primary?.busy ?? []).map((b) => ({
      start: b.start!,
      end: b.end!,
    }));

    return { busy };
  },

  async syncDoctorSchedule(params: {
    accessToken: string;
    refreshToken?: string;
    doctorId: string;
  }): Promise<void> {
    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({
      access_token: params.accessToken,
      refresh_token: params.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const { db } = await import("@mediclinic/db");
    const { eq, and } = await import("drizzle-orm");
    const { doctorAvailabilitySlots } = await import("@mediclinic/db");

    const slots = await db
      .select()
      .from(doctorAvailabilitySlots)
      .where(
        and(
          eq(doctorAvailabilitySlots.doctorId, params.doctorId),
          eq(doctorAvailabilitySlots.isBooked, false),
        )
      );

    for (const slot of slots) {
      await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: `Available: Dr. ${params.doctorId}`,
          start: { dateTime: `${slot.slotDate}T${slot.startTime}`, timeZone: "UTC" },
          end: { dateTime: `${slot.slotDate}T${slot.endTime}`, timeZone: "UTC" },
          transparency: "transparent",
        },
      });
    }
  },
};

export type DoctorCalendarServiceType = typeof doctorCalendarService;
