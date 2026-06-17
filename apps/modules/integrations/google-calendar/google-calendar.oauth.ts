import { google } from "googleapis";
import type { OAuth2Client } from "googleapis-common";
import type { OAuthConfig } from "./google-calendar.type";

export function getOAuthConfig(): OAuthConfig {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URL ?? '';
   console.log('redirectUri',redirectUri);
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set");
  }
  return { clientId, clientSecret, redirectUri };
}

export function getGoogleOAuthClient(config?: Partial<OAuthConfig>): OAuth2Client {
  const cfg = { ...getOAuthConfig(), ...config };
  return new google.auth.OAuth2(cfg.clientId, cfg.clientSecret, cfg.redirectUri);
}

export function generateAuthUrl(oauth2Client: OAuth2Client, userId: string): string {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
    state: JSON.stringify({ userId }),
  });
}

export async function exchangeCodeForTokens(oauth2Client: OAuth2Client, code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}
