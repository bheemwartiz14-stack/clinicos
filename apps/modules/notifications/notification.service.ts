import { notificationRepository } from "./notification.repository";
import type {
  Notification,
  NotificationFilter,
  PaginatedResponse,
  UnreadCountResponse,
} from "./notification.types";

export const notificationService = {
  async getNotifications(
    userId: string,
    page: number,
    pageSize: number,
    filter: NotificationFilter,
  ): Promise<PaginatedResponse<Notification>> {
    const { data, total } = await notificationRepository.findMany(
      userId,
      page,
      pageSize,
      filter,
    );

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async getUnreadCount(userId: string): Promise<UnreadCountResponse> {
    const unreadCount = await notificationRepository.countUnread(userId);
    return { unreadCount };
  },

  async markAsRead(
    ids: string[],
    userId: string,
  ): Promise<void> {
    await notificationRepository.markAsRead(ids, userId);
  },

  async create(
    input: Pick<Notification, "subject" | "description" | "body" | "userId" | "status">,
  ): Promise<Notification> {
    return notificationRepository.create(input);
  },
};
