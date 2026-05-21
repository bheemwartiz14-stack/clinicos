// @ts-nocheck
import type { GoogleCalendarTokens, GoogleCalendarEvent } from "../types/doctor.types";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_DOCTOR_CALENDAR_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI || `${APP_URL}/api/doctor-calendar/google/callback`;

export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events.readonly"
].join(" ");

export function getGoogleAuthUrl(state: string): string {
  if (!GOOGLE_CLIENT_ID) throw new Error("GOOGLE_CLIENT_ID is not configured.");
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID || "",
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: GOOGLE_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<GoogleCalendarTokens> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID || "",
      client_secret: GOOGLE_CLIENT_SECRET || "",
      code,
      grant_type: "authorization_code",
      redirect_uri: GOOGLE_REDIRECT_URI
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<GoogleCalendarTokens> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID || "",
      client_secret: GOOGLE_CLIENT_SECRET || "",
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  return response.json();
}

export async function getCalendarEvents(
  accessToken: string,
  calendarId: string,
  timeMin: Date,
  timeMax: Date
): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: "false",
    maxResults: "250"
  });

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch calendar events: ${error}`);
  }

  const data = await response.json();
  return (data.items || []) as GoogleCalendarEvent[];
}

export function getBusySlotsFromEvents(
  events: GoogleCalendarEvent[]
): Array<{
  providerEventId: string;
  calendarId: string;
  title: string | null;
  startAt: Date;
  endAt: Date;
  isAllDay: boolean;
}> {
  return events
    .filter(event => {
      if (event.status === "cancelled") return false;
      if (event.transparency === "transparent") return false;
      return true;
    })
    .map(event => {
      const start = event.start.dateTime
        ? new Date(event.start.dateTime)
        : new Date(`${event.start.date}T00:00:00`);
      const end = event.end.dateTime
        ? new Date(event.end.dateTime)
        : new Date(`${event.end.date}T00:00:00`);

      return {
        providerEventId: event.id,
        calendarId: "primary",
        title: event.summary || null,
        startAt: start,
        endAt: end,
        isAllDay: !!event.start.date && !event.start.dateTime
      };
    });
}

export async function getCalendarFreebusy(
  accessToken: string,
  calendarId: string,
  timeMin: Date,
  timeMax: Date
): Promise<Array<{ start: Date; end: Date }>> {
  const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: calendarId }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch freebusy: ${error}`);
  }

  const data = await response.json();
  const calendar = data.calendars?.[calendarId];
  if (!calendar || calendar.errors) return [];

  return (calendar.busy || []).map((b: { start: string; end: string }) => ({
    start: new Date(b.start),
    end: new Date(b.end)
  }));
}

export async function revokeGoogleAccess(token: string): Promise<void> {
  await fetch("https://oauth2.googleapis.com/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token })
  });
}

export async function getGoogleUserInfo(accessToken: string): Promise<{ email: string; name?: string }> {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error("Failed to get user info");
  }

  return response.json();
}

export function buildStatePayload(data: { doctorId: string; userId: string }): string {
  return Buffer.from(JSON.stringify(data)).toString("base64url");
}

export function parseStatePayload(state: string): { doctorId: string; userId: string } | null {
  try {
    return JSON.parse(Buffer.from(state, "base64url").toString());
  } catch {
    return null;
  }
}
