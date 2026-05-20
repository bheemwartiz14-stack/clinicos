import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, isNull } from "drizzle-orm";
import { verifySessionToken, type SessionUser } from "@mediclinic/auth";
import { can, type Permission } from "@mediclinic/rbac";
import { userSessions, users } from "@mediclinic/db";
import { db } from "./db";
import { env } from "./env";

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(permission: Permission) {
    super(`Missing permission: ${permission}`);
    this.name = "ForbiddenError";
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.COOKIE_NAME)?.value;
  if (!token || !env.JWT_SECRET) return null;

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
  if (!session) {
    throw new UnauthorizedError();
  }
  if (!can(session.role, permission)) {
    throw new ForbiddenError(permission);
  }
  return session;
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

export async function requirePagePermission(permission: Permission): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (!can(session.role, permission)) {
    redirect("/403");
  }
  return session;
}

export async function requirePageSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
