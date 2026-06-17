import { google } from "googleapis";
import type { OAuth2Client } from "googleapis-common";
import type { OAuthConfig } from "./google-calendar.type";

export function getOAuthConfig(): OAuthConfig {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URL;

  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID must be set");
  }

  if (!clientSecret) {
    throw new Error("GOOGLE_CLIENT_SECRET must be set");
  }

  if (!redirectUri) {
    throw new Error("GOOGLE_REDIRECT_URL must be set");
  }

  return { clientId, clientSecret, redirectUri };
}

export function getGoogleOAuthClient(config?: Partial<OAuthConfig>): OAuth2Client {
  const cfg = { ...getOAuthConfig(), ...config };
  return new google.auth.OAuth2(
    cfg.clientId,
    cfg.clientSecret,
    cfg.redirectUri
  );
}

export function generateAuthUrl(
  oauth2Client: OAuth2Client,
  userId: string
): string {
  if (!userId) throw new Error("userId required for OAuth state");

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

export async function exchangeCodeForTokens(
  oauth2Client: OAuth2Client,
  code: string
) {
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token) {
    throw new Error("Google did not return access_token");
  }

  return tokens;
}