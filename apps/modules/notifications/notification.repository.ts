import { db, notificationLog } from "@mediclinic/db";
import {
  and,
  desc,
  eq,
  count,
  sql,
  inArray,
} from "drizzle-orm";
import type {
  Notification,
  NotificationFilter,
} from "./notification.types";

const NOTIFICATION_FIELDS = {
  id: notificationLog.id,
  subject: notificationLog.subject,
  description: notificationLog.description,
  body: notificationLog.body,
  status: notificationLog.status,
  error: notificationLog.error,
  sentAt: notificationLog.sentAt,
  userId: notificationLog.userId,
  isRead: notificationLog.isRead,
  readAt: notificationLog.readAt,
  createdAt: notificationLog.createdAt,
} as const;

function buildFilterClause(userId: string, filter: NotificationFilter) {
  const clauses = [eq(notificationLog.userId, userId)];
  if (filter === "read") {
    clauses.push(eq(notificationLog.isRead, true));
  } else if (filter === "unread") {
    clauses.push(eq(notificationLog.isRead, false));
  }
  return and(...clauses);
}

export const notificationRepository = {
  async findMany(
    userId: string,
    page: number,
    pageSize: number,
    filter: NotificationFilter,
  ): Promise<{ data: Notification[]; total: number }> {
    const whereClause = buildFilterClause(userId, filter);

    const [totalResult] = await db
      .select({ count: count() })
      .from(notificationLog)
      .where(whereClause);

    const data = await db
      .select(NOTIFICATION_FIELDS)
      .from(notificationLog)
      .where(whereClause)
      .orderBy(desc(notificationLog.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return { data, total: totalResult?.count ?? 0 };
  },

  async countUnread(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notificationLog)
      .where(
        and(
          eq(notificationLog.userId, userId),
          eq(notificationLog.isRead, false),
        ),
      );

    return result?.count ?? 0;
  },

  async markAsRead(ids: string[], userId: string): Promise<void> {
    await db
      .update(notificationLog)
      .set({ isRead: true, readAt: sql`NOW()` })
      .where(
        and(
          inArray(notificationLog.id, ids),
          eq(notificationLog.userId, userId),
        ),
      );
  },

  async create(
    input: Pick<Notification, "subject" | "description" | "body" | "userId" | "status">,
  ): Promise<Notification> {
    const [created] = await db
      .insert(notificationLog)
      .values({
        subject: input.subject ?? null,
        description: input.description ?? null,
        body: input.body ?? null,
        userId: input.userId,
        status: input.status,
      })
      .returning(NOTIFICATION_FIELDS);

    return created;
  },
};
