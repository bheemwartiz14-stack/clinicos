import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { and, eq, gt } from "drizzle-orm";
import { env } from "./env";
import type { SessionUser } from "@mediclinic/auth";
import { verifySessionToken } from "@mediclinic/auth";
import { can, type Permission } from "@mediclinic/rbac";
import { db, userSessions } from "@mediclinic/db";

function getJwtSecret(): string {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  return env.JWT_SECRET;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const session = await verifySessionToken(token, getJwtSecret());
    const [storedSession] = await db
      .select({ id: userSessions.id })
      .from(userSessions)
      .where(and(eq(userSessions.id, session.sessionId), eq(userSessions.userId, session.userId), eq(userSessions.isActive, true), gt(userSessions.expiresAt, new Date())))
      .limit(1);

    return storedSession ? session : null;
  } catch {
    return null;
  }
}

export async function requirePageSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect("/login" as Route);
  }

  return session;
}

export async function requirePagePermission(permission: Permission): Promise<SessionUser> {
  const session = await requirePageSession();
  if (!can(session.role, permission)) {
    redirect("/403" as Route);
  }

  return session;
}

export const requirePermission = requirePagePermission;
