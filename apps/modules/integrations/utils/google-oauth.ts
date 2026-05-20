import { env } from "@/lib/env";
import type { IntegrationProvider, GoogleOAuthTokens } from "../types/integration.types";

const defaultCalendarScopes = [
  "openid",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events.readonly"
].join(" ");

const defaultMeetScopes = [
  "openid",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/calendar"
].join(" ");

function normalizeGoogleScopes(scopes: string) {
  return scopes
    .split(/[\s,]+/)
    .map((scope) => scope.trim())
    .filter(Boolean)
    .join(" ");
}

function normalizeOrigin(origin?: string | null) {
  if (!origin) return null;
  try {
    const url = new URL(origin);
    return url.origin;
  } catch {
    return null;
  }
}

export function googleRedirectUri(provider: IntegrationProvider, origin?: string | null) {
  const baseUrl = normalizeOrigin(origin);
  if (baseUrl) {
    return provider === "google_calendar"
      ? `${baseUrl}/api/integrations/google-calendar/callback`
      : `${baseUrl}/api/integrations/google-meet/callback`;
  }

  if (provider === "google_calendar") {
    return env.GOOGLE_CALENDAR_REDIRECT_URI
      || env.GOOGLE_REDIRECT_URI
      || `${env.NEXT_PUBLIC_APP_URL}/api/integrations/google-calendar/callback`;
  }
  return env.GOOGLE_MEET_REDIRECT_URI || `${env.NEXT_PUBLIC_APP_URL}/api/integrations/google-meet/callback`;
}

export function googleScopes(provider: IntegrationProvider) {
  if (provider === "google_calendar") return normalizeGoogleScopes(env.GOOGLE_CALENDAR_SCOPES || defaultCalendarScopes);
  return normalizeGoogleScopes(env.GOOGLE_MEET_SCOPES || defaultMeetScopes);
}

export function buildGoogleAuthUrl(input: { provider: IntegrationProvider; doctorId: string; userId: string; origin?: string | null }) {
  if (!env.GOOGLE_CLIENT_ID) throw new Error("GOOGLE_CLIENT_ID is not configured.");

  const state = Buffer.from(JSON.stringify(input)).toString("base64url");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", googleRedirectUri(input.provider, input.origin));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", googleScopes(input.provider));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  return url.toString();
}

export function parseGoogleState(state: string | null): { provider: IntegrationProvider; doctorId: string; userId: string } {
  if (!state) throw new Error("Missing OAuth state.");
  const parsed = JSON.parse(Buffer.from(state, "base64url").toString()) as { provider: string; doctorId: string; userId: string };
  if (parsed.provider !== "google_calendar" && parsed.provider !== "google_meet") {
    throw new Error("Invalid OAuth state.");
  }
  return { provider: parsed.provider, doctorId: parsed.doctorId, userId: parsed.userId };
}

export async function exchangeGoogleCode(provider: IntegrationProvider, code: string, origin?: string | null): Promise<GoogleOAuthTokens> {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth is not configured.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: googleRedirectUri(provider, origin),
      grant_type: "authorization_code"
    })
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<GoogleOAuthTokens>;
}

export async function refreshGoogleToken(refreshToken: string): Promise<GoogleOAuthTokens> {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth is not configured.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<GoogleOAuthTokens>;
}

export async function getGoogleAccountEmail(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) throw new Error("Could not read Google profile.");
  const profile = await response.json() as { email?: string };
  if (!profile.email) throw new Error("Google profile did not include an email.");
  return profile.email;
}
