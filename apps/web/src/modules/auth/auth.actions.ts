"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  clearLoginRateLimit,
  formatRetryAfter,
  getLoginRateLimitKey,
  getLoginRateLimitState,
  recordFailedLoginAttempt,
} from "./auth.rate-limit";
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
  const attemptKey = getLoginRateLimitKey(ipAddress, input.data.email);
  const rateLimit = getLoginRateLimitState(attemptKey);

  if (rateLimit.limited) {
    return {
      message: `Too many login attempts. Please try again in ${formatRetryAfter(
        rateLimit.retryAfterSeconds,
      )}.`,
    };
  }

  const user = await login(input.data.email, input.data.password);

  if (!user) {
    recordFailedLoginAttempt(attemptKey);
    return { message: "Invalid email or password." };
  }

  clearLoginRateLimit(attemptKey);

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
