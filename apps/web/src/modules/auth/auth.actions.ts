"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  createUserSession,
  getSessionCookieOptions,
  login,
  logout,
  sessionCookieName,
} from "./auth.service";
import { loginSchema } from "./auth.validation";

export type LoginActionState = {
  message?: string;
};

type LoginAttempt = {
  count: number;
  resetAt: number;
};

const loginAttempts = new Map<string, LoginAttempt>();
const rateLimitWindowMs = 15 * 60 * 1000;
const maxLoginAttempts = 5;

function getSafeNextPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

function getClientIp(headerStore: Headers) {
  const forwardedFor = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || headerStore.get("x-real-ip") || "unknown";
}

function getAttemptKey(ipAddress: string, email: string) {
  return `${ipAddress}:${email.toLowerCase()}`;
}

function isRateLimited(key: string) {
  const now = Date.now();
  const attempt = loginAttempts.get(key);

  if (!attempt || attempt.resetAt <= now) {
    loginAttempts.delete(key);
    return false;
  }

  return attempt.count >= maxLoginAttempts;
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const current = loginAttempts.get(key);

  if (!current || current.resetAt <= now) {
    loginAttempts.set(key, {
      count: 1,
      resetAt: now + rateLimitWindowMs,
    });
    return;
  }

  loginAttempts.set(key, {
    ...current,
    count: current.count + 1,
  });
}

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const input = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!input.success) {
    return { message: "Invalid email or password." };
  }

  const headerStore = await headers();
  const ipAddress = getClientIp(headerStore);
  const attemptKey = getAttemptKey(ipAddress, input.data.email);

  if (isRateLimited(attemptKey)) {
    return { message: "Too many login attempts. Please try again later." };
  }

  const user = await login(input.data.email, input.data.password);

  if (!user) {
    recordFailedAttempt(attemptKey);
    return { message: "Invalid email or password." };
  }

  loginAttempts.delete(attemptKey);

  const { token } = await createUserSession({
    ipAddress,
    user,
    userAgent: headerStore.get("user-agent"),
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, getSessionCookieOptions());

  redirect(getSafeNextPath(formData.get("next")));
}

export async function logoutAction() {
  await logout();

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, "", getSessionCookieOptions(0));

  redirect("/login");
}
