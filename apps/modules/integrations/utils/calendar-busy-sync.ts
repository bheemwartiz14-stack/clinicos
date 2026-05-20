import crypto from "node:crypto";
import { refreshGoogleToken } from "./google-oauth";
import { decryptToken, encryptToken } from "./google-token-encryption";
import type { GoogleCalendarBusyEvent } from "../types/integration.types";

export async function ensureAccessToken(integration: {
  id: string;
  accessToken: string | null;
  refreshToken: string | null;
  expiryDate: string | Date | null;
}, onRefresh: (data: { accessToken: string; expiryDate: Date; tokenType?: string; scope?: string }) => Promise<void>) {
  const existingAccessToken = decryptToken(integration.accessToken);
  const refreshToken = decryptToken(integration.refreshToken);

  if (existingAccessToken && integration.expiryDate && new Date(integration.expiryDate) > new Date(Date.now() + 60_000)) {
    return existingAccessToken;
  }

  if (!refreshToken) {
    throw new Error("Google refresh token is missing. Reconnect the integration.");
  }

  const refreshed = await refreshGoogleToken(refreshToken);
  const expiryDate = new Date(Date.now() + refreshed.expires_in * 1000);
  await onRefresh({
    accessToken: encryptToken(refreshed.access_token) ?? "",
    expiryDate,
    tokenType: refreshed.token_type,
    scope: refreshed.scope
  });
  return refreshed.access_token;
}

export async function fetchGoogleBusyEvents(input: {
  accessToken: string;
  calendarId: string;
  timeMin: Date;
  timeMax: Date;
}): Promise<GoogleCalendarBusyEvent[]> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(input.calendarId)}/events?` +
      new URLSearchParams({
        timeMin: input.timeMin.toISOString(),
        timeMax: input.timeMax.toISOString(),
        singleEvents: "true",
        orderBy: "startTime"
      }),
    { headers: { Authorization: `Bearer ${input.accessToken}` } }
  );

  if (!response.ok) {
    throw new Error(`Google Calendar sync failed: ${await response.text()}`);
  }

  const data = await response.json() as {
    items?: Array<{
      id?: string;
      summary?: string;
      start?: { dateTime?: string; date?: string };
      end?: { dateTime?: string; date?: string };
      status?: string;
      transparency?: string;
    }>;
  };

  return (data.items ?? []).flatMap((event) => {
    if (event.status === "cancelled" || event.transparency === "transparent") return [];
    const start = event.start?.dateTime ?? event.start?.date;
    const end = event.end?.dateTime ?? event.end?.date;
    if (!start || !end) return [];

    return [{
      providerEventId: event.id ?? crypto.randomUUID(),
      calendarId: input.calendarId,
      title: event.summary ?? null,
      startAt: new Date(start),
      endAt: new Date(end),
      isAllDay: !event.start?.dateTime,
      status: "busy" as const
    }];
  });
}
