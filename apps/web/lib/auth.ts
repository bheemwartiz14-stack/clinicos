import { cookies } from "next/headers";
import { and, eq, gt, isNull } from "drizzle-orm";
import { verifySessionToken, type SessionUser } from "@mediclinic/auth";
import { can, type Permission } from "@mediclinic/rbac";
import { userSessions, users } from "@mediclinic/db";
import { db } from "./db";
import { env } from "./env";

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const session = await verifySessionToken(token, env.JWT_SECRET ?? "");
    const [activeSession] = await db
      .select({
        sessionId: userSessions.id,
        userId: users.id,
        branchId: users.branchId,
        role: users.role,
        email: users.email,
        username: users.username,
        name: users.name
      })
      .from(userSessions)
      .innerJoin(users, eq(users.id, userSessions.userId))
      .where(
        and(
          eq(userSessions.id, session.sessionId),
          eq(userSessions.userId, session.userId),
          isNull(userSessions.revokedAt),
          gt(userSessions.expiresAt, new Date()),
          eq(users.isActive, true)
        )
      )
      .limit(1);

    return activeSession ?? null;
  } catch {
    return null;
  }
}

export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const session = await getSession();
  if (!session || !can(session.role, permission)) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
