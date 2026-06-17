import { and, desc, eq, count, gte, lte, sql, type SQL } from "drizzle-orm";
import { auditLogs, db } from "@mediclinic/db";
import type { CreateAuditLogInput, AuditLogFilters } from "./audit-logs.types";

export const auditLogsRepository = {
  async create(input: CreateAuditLogInput) {
    const [row] = await db
      .insert(auditLogs)
      .values({
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        oldValues: input.oldValues ?? null,
        newValues: input.newValues ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      })
      .returning();

    return row;
  },

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.id, id))
      .limit(1);

    return row ?? null;
  },

  async findMany(filters: AuditLogFilters) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;

    const clauses: SQL[] = [];
    if (filters.userId) clauses.push(eq(auditLogs.userId, filters.userId));
    if (filters.action) clauses.push(eq(auditLogs.action, filters.action));
    if (filters.entity) clauses.push(eq(auditLogs.entity, filters.entity));
    if (filters.entityId) clauses.push(eq(auditLogs.entityId, filters.entityId));
    if (filters.fromDate) clauses.push(gte(auditLogs.createdAt, filters.fromDate));
    if (filters.toDate) clauses.push(lte(auditLogs.createdAt, filters.toDate));

    const where = clauses.length > 0 ? and(...clauses) : undefined;

    const [rows, totalResult] = await Promise.all([
      db
        .select()
        .from(auditLogs)
        .where(where)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(auditLogs)
        .where(where),
    ]);

    return {
      items: rows,
      total: Number(totalResult[0]?.count ?? 0),
      page,
      limit,
    };
  },

  async delete(id: string) {
    const [row] = await db
      .delete(auditLogs)
      .where(eq(auditLogs.id, id))
      .returning();

    return row ?? null;
  },
};
