import { desc, eq, and, like, sql } from "drizzle-orm";
import { db, notificationLogs, notificationTemplates } from "@mediclinic/db";

export type NotificationLogRecord = {
  id: string;
  templateId: string | null;
  templateName: string | null;
  channel: "email" | "sms" | "whatsapp" | "system";
  recipient: string;
  subject: string | null;
  body: string | null;
  status: "queued" | "sent" | "failed" | "cancelled";
  error: string | null;
  sentAt: Date | null;
  userId: string | null;
  createdAt: Date;
};

export type LogFilters = {
  channel?: string;
  status?: string;
  q?: string;
  page?: number;
  pageSize?: number;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export const notificationLogService = {
  async list(filters: LogFilters = {}): Promise<PaginatedResult<NotificationLogRecord>> {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(50, Math.max(10, filters.pageSize ?? 25));
    const offset = (page - 1) * pageSize;

    const conditions: ReturnType<typeof and>[] = [];

    if (filters.channel) {
      conditions.push(eq(notificationLogs.channel, filters.channel as typeof notificationLogs.$inferSelect.channel));
    }

    if (filters.status) {
      conditions.push(eq(notificationLogs.status, filters.status as typeof notificationLogs.$inferSelect.status));
    }

    if (filters.q) {
      const likePattern = `%${filters.q}%`;
      conditions.push(
        sql`(${like(notificationLogs.recipient, likePattern)} OR ${like(notificationLogs.subject ?? sql`''`, likePattern)} OR ${like(notificationLogs.body ?? sql`''`, likePattern)})`,
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [total, rows] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(notificationLogs).where(where).then((r) => Number(r[0]?.count ?? 0)),
      db
        .select({
          log: notificationLogs,
          template: notificationTemplates,
        })
        .from(notificationLogs)
        .leftJoin(notificationTemplates, eq(notificationLogs.templateId, notificationTemplates.id))
        .where(where)
        .orderBy(desc(notificationLogs.createdAt))
        .limit(pageSize)
        .offset(offset),
    ]);

    return {
      data: rows.map(({ log, template }) => ({
        id: log.id,
        templateId: log.templateId,
        templateName: template?.name ?? null,
        channel: log.channel,
        recipient: log.recipient,
        subject: log.subject,
        body: log.body,
        status: log.status,
        error: log.error,
        sentAt: log.sentAt,
        userId: log.userId,
        createdAt: log.createdAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async get(id: string): Promise<NotificationLogRecord | null> {
    const [row] = await db
      .select({
        log: notificationLogs,
        template: notificationTemplates,
      })
      .from(notificationLogs)
      .leftJoin(notificationTemplates, eq(notificationLogs.templateId, notificationTemplates.id))
      .where(eq(notificationLogs.id, id))
      .limit(1);

    if (!row) return null;

    return {
      id: row.log.id,
      templateId: row.log.templateId,
      templateName: row.template?.name ?? null,
      channel: row.log.channel,
      recipient: row.log.recipient,
      subject: row.log.subject,
      body: row.log.body,
      status: row.log.status,
      error: row.log.error,
      sentAt: row.log.sentAt,
      userId: row.log.userId,
      createdAt: row.log.createdAt,
    };
  },
};
