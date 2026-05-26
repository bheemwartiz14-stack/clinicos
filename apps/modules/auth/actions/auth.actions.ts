"use server";

import { redirect } from "next/navigation";
import type { Route } from "next";
import { createScopedLogger } from "@mediclinic/logger";
import { headers } from "next/headers";
import { getSession } from "../../../web/lib/auth";
import { loginSchema, passwordResetRequestSchema, passwordResetSchema } from "../validations/auth.validation";
import { authService } from "../services/auth.service";
import { authRateLimitService } from "../services/auth-rate-limit.service";
import { clearSessionCookie, setSessionCookie } from "../services/session-cookie.service";

const logger = createScopedLogger("auth-actions");

export type AuthActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: {
    identifier?: string;
    password?: string;
  };
  resetToken?: string;
};

export async function loginAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Check your login details",
      fieldErrors: {
        identifier: fieldErrors.identifier?.[0],
        password: fieldErrors.password?.[0]
      }
    };
  }

  const headerStore = await headers();
  const ipAddress = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip") ?? "unknown";
  const userAgent = headerStore.get("user-agent") ?? undefined;
  const rateLimitKey = `login:${ipAddress}:${parsed.data.identifier.trim().toLowerCase()}`;
  const rateLimit = authRateLimitService.consume(rateLimitKey);

  if (rateLimit.limited) {
    logger.warn("Login rate limit exceeded", { ipAddress, identifier: parsed.data.identifier });
    return {
      ok: false,
      message: `Too many sign-in attempts. Try again in ${rateLimit.retryAfterSeconds} seconds.`
    };
  }

  try {
    const session = await authService.login(parsed.data, {
      ipAddress,
      userAgent
    });
    authRateLimitService.reset(rateLimitKey);
    await setSessionCookie(session);
  } catch (error) {
    logger.error("Login failed", { error });
    return { ok: false, message: error instanceof Error ? error.message : "Unable to sign in" };
  }

  return { ok: true };
}

export async function logoutAction() {
  const session = await getSession();
  const headerStore = await headers();
  const ipAddress = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip") ?? undefined;
  const userAgent = headerStore.get("user-agent") ?? undefined;
  if (session) {
    await authService.logout(session.sessionId, { ipAddress, userAgent });
  }
  await clearSessionCookie();
  redirect("/login" as Route);
}

export async function requestPasswordResetAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = passwordResetRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Enter your email or username" };
  }

  const result = await authService.requestPasswordReset(parsed.data);
  return {
    ok: true,
    message: "If an active account exists, a password reset link has been prepared.",
    resetToken: result.token
  };
}

export async function resetPasswordAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = passwordResetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check your reset link and new password" };
  }

  try {
    await authService.resetPassword(parsed.data);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to reset password" };
  }

  return { ok: true, message: "Password reset. You can now sign in." };
}
