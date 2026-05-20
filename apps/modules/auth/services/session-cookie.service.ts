import { cookies } from "next/headers";
import { createSessionToken, type SessionUser } from "@mediclinic/auth";
import { env } from "@/lib/env";

export async function setSessionCookie(user: SessionUser) {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  const token = await createSessionToken(user, env.JWT_SECRET);

  const cookieStore = await cookies();

  cookieStore.set(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(env.COOKIE_NAME);
}