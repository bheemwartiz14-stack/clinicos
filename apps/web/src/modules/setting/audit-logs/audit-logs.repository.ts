import { db, schema } from "@mediclinicpro/db";
import { count, desc, gte, ilike, or } from "drizzle-orm";
import type { AuditLogListItem } from "./audit-logs.types";

type FindAuditLogsOptions = {
  query?: string;
  limit?: number;
};

function mapAuditLog(row: typeof schema.activityLogs.$inferSelect): AuditLogListItem {
  return {
    id: row.id,
    action: row.action,
    module: row.module,
    description: row.description,
    userId: row.userId,
    userName: row.userName,
    ipAddress: row.ipAddress,
    createdAt: row.createdAt,
  };
}

function buildAuditLogSearch(query?: string) {
  const normalizedQuery = query?.trim();

  if (!normalizedQuery) return undefined;

  const search = `%${normalizedQuery}%`;

  return or(
    ilike(schema.activityLogs.action, search),
    ilike(schema.activityLogs.module, search),
    ilike(schema.activityLogs.description, search),
    ilike(schema.activityLogs.userName, search),
    ilike(schema.activityLogs.ipAddress, search),
  );
}

export async function findAuditLogs({
  limit = 50,
  query,
}: FindAuditLogsOptions = {}): Promise<AuditLogListItem[]> {
  const rows = await db
    .select()
    .from(schema.activityLogs)
    .where(buildAuditLogSearch(query))
    .orderBy(desc(schema.activityLogs.createdAt))
    .limit(limit);
  return rows.map(mapAuditLog);
}

export async function countAuditLogs(query?: string) {
  const [result] = await db
    .select({ value: count() })
    .from(schema.activityLogs)
    .where(buildAuditLogSearch(query));

  return Number(result?.value ?? 0);
}

export async function countAuditLogsSince(date: Date) {
  const [result] = await db
    .select({ value: count() })
    .from(schema.activityLogs)
    .where(gte(schema.activityLogs.createdAt, date));

  return Number(result?.value ?? 0);
}
