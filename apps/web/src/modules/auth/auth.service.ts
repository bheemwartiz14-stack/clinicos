import type { Role } from "@mediclinicpro/types";
import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

import {
  createSessionRecord,
  deleteSessionByToken,
  findUserById,
  findUserByUsername,
  findValidSessionByToken,
} from "./auth.model";

import type { AuthUser, SessionUser } from "./auth.types";

export const sessionCookieName = "accessToken";

const sessionDurationSeconds = 60 * 60 * 24 * 7;

function getSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters");
  }

  return new TextEncoder().encode(secret);
}

export function getSessionCookieOptions(maxAge = sessionDurationSeconds) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function createSessionToken(user: {
  id: string;
  role: Role;
}) {
  return new SignJWT({
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${sessionDurationSeconds}s`)
    .sign(getSecret());
}

export async function createUserSession(input: {
  user: AuthUser;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const expiresAt = new Date(Date.now() + sessionDurationSeconds * 1000);

  const token = await createSessionToken({
    id: input.user.id,
    role: input.user.role,
  });

  await createSessionRecord({
    expiresAt,
    ipAddress: input.ipAddress ?? null,
    token,
    userAgent: input.userAgent ?? null,
    userId: input.user.id,
  });

  return {
    expiresAt,
    token,
  };
}

export async function login(
  username: string,
  password: string,
): Promise<AuthUser | null> {
  const normalizedUsername = username.toLowerCase().trim();
  const user = await findUserByUsername(normalizedUsername);
  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    roleId: user.roleId,
    permissions: user.permissions,
  };
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, getSecret());
    const userId = verified.payload.sub;

    if (!userId) {
      return null;
    }

    const session = await findValidSessionByToken(token);

    if (!session || session.userId !== userId) {
      return null;
    }

    const user = await findUserById(userId);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      roleId: user.roleId,
      permissions: user.permissions,
      sessionId: session.id,
      sessionExpiresAt: session.expiresAt,
    };
  } catch {
    return null;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (token) {
    await deleteSessionByToken(token);
  }

  cookieStore.delete(sessionCookieName);
}