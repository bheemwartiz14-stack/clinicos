import { db, notificationLog } from "@mediclinic/db";
import { desc, eq, and, sql } from "drizzle-orm";

export type SystemNotificationType = "info" | "warning" | "error" | "success";

export type SystemNotificationRecord = {
  id: string;
  userId: string;
  type: SystemNotificationType;
  title: string;
  message: string | null;
  link: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
};

export type CreateSystemNotificationInput = {
  userId: string;
  type?: SystemNotificationType;
  title: string;
  message?: string | null;
  link?: string | null;
};

export const systemNotificationService = {
  async create(input: CreateSystemNotificationInput): Promise<SystemNotificationRecord> {
    const [row] = await db
      .insert(notificationLog)
      .values({
        userId: input.userId,
        subject: input.title,
        description: input.message ?? null,
        body: input.link ?? null,
        status: "sent",
      })
      .returning();

    return {
      id: row.id,
      userId: row.userId!,
      type: "info",
      title: row.subject ?? "",
      message: row.description,
      link: row.body,
      isRead: row.isRead,
      readAt: row.readAt,
      createdAt: row.createdAt,
    };
  },

  async getForUser(
    userId: string,
    page = 1,
    pageSize = 25,
  ): Promise<{ notifications: SystemNotificationRecord[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const rows = await db
      .select()
      .from(notificationLog)
      .where(eq(notificationLog.userId, userId))
      .orderBy(desc(notificationLog.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notificationLog)
      .where(eq(notificationLog.userId, userId));

    const total = Number(count);

    return {
      notifications: rows.map((r) => ({
        id: r.id,
        userId: r.userId!,
        type: "info" as const,
        title: r.subject ?? "",
        message: r.description,
        link: r.body,
        isRead: r.isRead,
        readAt: r.readAt,
        createdAt: r.createdAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async getBell(userId: string): Promise<{ notifications: SystemNotificationRecord[]; unreadCount: number }> {
    const rows = await db
      .select()
      .from(notificationLog)
      .where(eq(notificationLog.userId, userId))
      .orderBy(desc(notificationLog.createdAt))
      .limit(20);

    const unreadCount = rows.filter((n) => !n.isRead).length;

    return {
      notifications: rows.map((r) => ({
        id: r.id,
        userId: r.userId!,
        type: "info" as const,
        title: r.subject ?? "",
        message: r.description,
        link: r.body,
        isRead: r.isRead,
        readAt: r.readAt,
        createdAt: r.createdAt,
      })),
      unreadCount,
    };
  },

  async markRead(notificationId: string, userId: string): Promise<void> {
    await db
      .update(notificationLog)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notificationLog.id, notificationId),
          eq(notificationLog.userId, userId),
        ),
      );
  },

  async markAllRead(userId: string): Promise<void> {
    await db
      .update(notificationLog)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notificationLog.userId, userId),
          eq(notificationLog.isRead, false),
        ),
      );
  },

  async getUnreadCount(userId: string): Promise<number> {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notificationLog)
      .where(
        and(
          eq(notificationLog.userId, userId),
          eq(notificationLog.isRead, false),
        ),
      );
    return Number(count);
  },
};
