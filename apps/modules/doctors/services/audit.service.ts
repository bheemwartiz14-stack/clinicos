import { sql, eq, desc, and, gte, lte } from "drizzle-orm";
import { db, auditLogs } from "@mediclinic/db";
import { users } from "@mediclinic/db";

export type AuditLogRecord = {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  oldValues: any;
  newValues: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
};

export const auditService = {
  async log(params: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await db.insert(auditLogs).values({
      userId: params.userId ?? null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId ?? null,
      oldValues: params.oldValues ?? null,
      newValues: params.newValues ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    });
  },

  async list(params?: {
    entity?: string;
    action?: string;
    userId?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLogRecord[]; total: number }> {
    const conditions: any[] = [];

    if (params?.entity) conditions.push(eq(auditLogs.entity, params.entity));
    if (params?.action) conditions.push(eq(auditLogs.action, params.action));
    if (params?.userId) conditions.push(eq(auditLogs.userId, params.userId));
    if (params?.fromDate) conditions.push(gte(auditLogs.createdAt, params.fromDate));
    if (params?.toDate) conditions.push(lte(auditLogs.createdAt, params.toDate));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select({
        log: auditLogs,
        user: users,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(params?.limit ?? 50)
      .offset(params?.offset ?? 0);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(whereClause ?? sql`TRUE`);

    const logs: AuditLogRecord[] = rows.map(({ log, user }) => ({
      id: log.id,
      userId: log.userId,
      userName: user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : null,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      oldValues: log.oldValues,
      newValues: log.newValues,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
    }));

    return { logs, total: Number(count) };
  },
};
