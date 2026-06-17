import { google } from "googleapis";
import { getGoogleOAuthClient } from "./google-calendar.oauth";
import type { OAuth2Client } from "googleapis-common";

export function getCalendarClient(auth: OAuth2Client) {
  return google.calendar({ version: "v3", auth });
}
