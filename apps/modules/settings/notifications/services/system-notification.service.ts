import { db, systemNoctifications } from "@mediclinic/db";
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
      .insert(systemNoctifications)
      .values({
        userId: input.userId,
        type: input.type ?? "info",
        title: input.title,
        message: input.message ?? null,
        link: input.link ?? null,
      })
      .returning();
    return row;
  },

  async getForUser(
    userId: string,
    page = 1,
    pageSize = 25,
  ): Promise<{ notifications: SystemNotificationRecord[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const rows = await db
      .select()
      .from(systemNoctifications)
      .where(eq(systemNoctifications.userId, userId))
      .orderBy(desc(systemNoctifications.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(systemNoctifications)
      .where(eq(systemNoctifications.userId, userId));

    const total = Number(count);

    return {
      notifications: rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async getBell(userId: string): Promise<{ notifications: SystemNotificationRecord[]; unreadCount: number }> {
    const rows = await db
      .select()
      .from(systemNoctifications)
      .where(eq(systemNoctifications.userId, userId))
      .orderBy(desc(systemNoctifications.createdAt))
      .limit(20);

    const unreadCount = rows.filter((n) => !n.isRead).length;

    return {
      notifications: rows,
      unreadCount,
    };
  },

  async markRead(notificationId: string, userId: string): Promise<void> {
    await db
      .update(systemNoctifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(systemNoctifications.id, notificationId),
          eq(systemNoctifications.userId, userId),
        ),
      );
  },

  async markAllRead(userId: string): Promise<void> {
    await db
      .update(systemNoctifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(systemNoctifications.userId, userId),
          eq(systemNoctifications.isRead, false),
        ),
      );
  },

  async getUnreadCount(userId: string): Promise<number> {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(systemNoctifications)
      .where(
        and(
          eq(systemNoctifications.userId, userId),
          eq(systemNoctifications.isRead, false),
        ),
      );
    return Number(count);
  },
};
