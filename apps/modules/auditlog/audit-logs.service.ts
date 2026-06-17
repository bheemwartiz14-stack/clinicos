import { db, users as usersTable } from "@mediclinic/db";
import { eq, desc, and, gte, lte, sql, count, type SQL } from "drizzle-orm";
import { auditLogs } from "@mediclinic/db";
import { auditLogsRepository } from "./audit-logs.repository";
import { createAuditLogSchema, auditLogFilterSchema } from "./audit-logs.validation";
import type { CreateAuditLogInput, AuditLogFilters, AuditLogRecord, PaginatedAuditLogsResponse } from "./audit-logs.types";

function toRecord(row: typeof auditLogs.$inferSelect & { userName?: string | null }): AuditLogRecord {
  return {
    id: row.id,
    userId: row.userId,
    userName: row.userName ?? null,
    action: row.action,
    entity: row.entity,
    entityId: row.entityId,
    oldValues: row.oldValues as Record<string, unknown> | null,
    newValues: row.newValues as Record<string, unknown> | null,
    ipAddress: row.ipAddress,
    userAgent: row.userAgent,
    createdAt: row.createdAt,
  };
}

export const auditLogsService = {
  async create(input: CreateAuditLogInput) {
    const validated = createAuditLogSchema.parse(input);
    return auditLogsRepository.create(validated);
  },

  async getById(id: string) {
    return auditLogsRepository.findById(id);
  },

  async list(filters: AuditLogFilters = {}): Promise<PaginatedAuditLogsResponse> {
    const parsed = auditLogFilterSchema.parse(filters);
    const page = parsed.page;
    const limit = parsed.limit;
    const offset = (page - 1) * limit;

    const clauses: SQL[] = [];
    if (parsed.userId) clauses.push(eq(auditLogs.userId, parsed.userId));
    if (parsed.action) clauses.push(eq(auditLogs.action, parsed.action));
    if (parsed.entity) clauses.push(eq(auditLogs.entity, parsed.entity));
    if (parsed.entityId) clauses.push(eq(auditLogs.entityId, parsed.entityId));
    if (parsed.fromDate) clauses.push(gte(auditLogs.createdAt, parsed.fromDate));
    if (parsed.toDate) clauses.push(lte(auditLogs.createdAt, parsed.toDate));

    const where = clauses.length > 0 ? and(...clauses) : undefined;

    const [rows, totalResult] = await Promise.all([
      db
        .select({
          log: auditLogs,
          userName: sql`concat(${usersTable.firstName}, ' ', ${usersTable.lastName})`.mapWith(String).as("user_name"),
        })
        .from(auditLogs)
        .leftJoin(usersTable, eq(auditLogs.userId, usersTable.id))
        .where(where)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(auditLogs)
        .where(where),
    ]);

    const logs: AuditLogRecord[] = rows.map(({ log, userName }) => ({
      id: log.id,
      userId: log.userId,
      userName: userName ?? null,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      oldValues: log.oldValues as Record<string, unknown> | null,
      newValues: log.newValues as Record<string, unknown> | null,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
    }));

    return { logs, total: Number(totalResult[0]?.count ?? 0), page, limit };
  },

  async delete(id: string) {
    return auditLogsRepository.delete(id);
  },

  async log(input: CreateAuditLogInput) {
    return this.create(input);
  },

  async logCreate(userId: string, entity: string, entityId: string, newValues: Record<string, unknown>, ipAddress?: string, userAgent?: string) {
    return this.create({ userId, action: "CREATE", entity, entityId, newValues, ipAddress, userAgent });
  },

  async logUpdate(userId: string, entity: string, entityId: string, oldValues: Record<string, unknown>, newValues: Record<string, unknown>, ipAddress?: string, userAgent?: string) {
    return this.create({ userId, action: "UPDATE", entity, entityId, oldValues, newValues, ipAddress, userAgent });
  },

  async logDelete(userId: string, entity: string, entityId: string, oldValues: Record<string, unknown>, ipAddress?: string, userAgent?: string) {
    return this.create({ userId, action: "DELETE", entity, entityId, oldValues, ipAddress, userAgent });
  },

  async logLogin(userId: string, ipAddress?: string, userAgent?: string) {
    return this.create({ userId, action: "LOGIN", entity: "AUTH", ipAddress, userAgent });
  },

  async logLogout(userId: string, ipAddress?: string, userAgent?: string) {
    return this.create({ userId, action: "LOGOUT", entity: "AUTH", ipAddress, userAgent });
  },
};
