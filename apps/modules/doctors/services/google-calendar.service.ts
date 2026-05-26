import { google } from "googleapis";
import { eq, and } from "drizzle-orm";
import { db, doctorAvailabilitySlots } from "@mediclinic/db";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

type OAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

function getConfig(): OAuthConfig {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:3000/api/auth/google/callback",
  };
}

function getOAuth2Client(config?: OAuthConfig) {
  const cfg = config ?? getConfig();
  return new google.auth.OAuth2(cfg.clientId, cfg.clientSecret, cfg.redirectUri);
}

export const googleCalendarService = {
  getAuthUrl(doctorId: string): string {
    const oauth2Client = getOAuth2Client();
    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      state: doctorId,
      prompt: "consent",
    });
  },

  async handleCallback(code: string): Promise<{ tokens: any }> {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    return { tokens };
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
  }): Promise<{ id: string; hangoutLink?: string | null }> {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: params.accessToken,
      refresh_token: params.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event: any = {
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
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: params.accessToken,
      refresh_token: params.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const event: any = {};

    if (params.summary) event.summary = params.summary;
    if (params.description) event.description = params.description;
    if (params.startTime) event.start = { dateTime: params.startTime, timeZone: params.timeZone ?? "UTC" };
    if (params.endTime) event.end = { dateTime: params.endTime, timeZone: params.timeZone ?? "UTC" };

    await calendar.events.update({
      calendarId: "primary",
      eventId: params.eventId,
      requestBody: event,
    });
  },

  async deleteEvent(params: {
    accessToken: string;
    refreshToken?: string;
    eventId: string;
  }): Promise<void> {
    const oauth2Client = getOAuth2Client();
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
  }): Promise<{ busy: { start: string; end: string }[] }> {
    const oauth2Client = getOAuth2Client();
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
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: params.accessToken,
      refresh_token: params.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const slots = await db
      .select()
      .from(doctorAvailabilitySlots)
      .where(
        and(
          eq(doctorAvailabilitySlots.doctorId, params.doctorId),
          eq(doctorAvailabilitySlots.isBooked, false)
        )
      );

    for (const slot of slots) {
      const startDateTime = `${slot.slotDate}T${slot.startTime}`;
      const endDateTime = `${slot.slotDate}T${slot.endTime}`;

      await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: `Available: Dr. ${params.doctorId}`,
          start: { dateTime: startDateTime, timeZone: "UTC" },
          end: { dateTime: endDateTime, timeZone: "UTC" },
          transparency: "transparent",
        },
      });
    }
  },
};

export type GoogleCalendarService = typeof googleCalendarService;
