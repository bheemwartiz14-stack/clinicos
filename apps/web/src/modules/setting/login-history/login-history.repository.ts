import { db, schema } from "@mediclinicpro/db";
import { and, count, desc, eq, gte, ilike, or } from "drizzle-orm";
import type { LoginHistoryListItem } from "./login-history.types";

type FindLoginHistoryOptions = {
  query?: string;
  limit?: number;
  userId: string;
};

type LoginHistoryRow = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  expiresAt: Date;
};

function mapLoginHistory(row: LoginHistoryRow): LoginHistoryListItem {
  return {
    id: row.id,
    userId: row.userId,
    userName: row.userName,
    userEmail: row.userEmail,
    ipAddress: row.ipAddress,
    userAgent: row.userAgent,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
  };
}

function buildLoginHistorySearch(query?: string) {
  const normalizedQuery = query?.trim();

  if (!normalizedQuery) return undefined;

  const search = `%${normalizedQuery}%`;

  return or(
    ilike(schema.users.name, search),
    ilike(schema.users.email, search),
    ilike(schema.sessions.ipAddress, search),
    ilike(schema.sessions.userAgent, search),
  );
}

function buildLoginHistoryWhere(userId: string, query?: string) {
  const search = buildLoginHistorySearch(query);

  return search ? and(eq(schema.sessions.userId, userId), search) : eq(schema.sessions.userId, userId);
}

function baseLoginHistoryQuery() {
  return db
    .select({
      id: schema.sessions.id,
      userId: schema.sessions.userId,
      userName: schema.users.name,
      userEmail: schema.users.email,
      ipAddress: schema.sessions.ipAddress,
      userAgent: schema.sessions.userAgent,
      createdAt: schema.sessions.createdAt,
      expiresAt: schema.sessions.expiresAt,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id));
}

export async function findLoginHistory({
  limit = 50,
  query,
  userId,
}: FindLoginHistoryOptions): Promise<LoginHistoryListItem[]> {
  const rows = await baseLoginHistoryQuery()
    .where(buildLoginHistoryWhere(userId, query))
    .orderBy(desc(schema.sessions.createdAt))
    .limit(limit);

  return rows.map(mapLoginHistory);
}

export async function countLoginHistory(userId: string, query?: string) {
  const [result] = await db
    .select({ value: count() })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(buildLoginHistoryWhere(userId, query));

  return Number(result?.value ?? 0);
}

export async function countLoginHistorySince(userId: string, date: Date) {
  const [result] = await db
    .select({ value: count() })
    .from(schema.sessions)
    .where(and(eq(schema.sessions.userId, userId), gte(schema.sessions.createdAt, date)));

  return Number(result?.value ?? 0);
}
