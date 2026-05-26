"use server";

import { getSession } from "@/lib/auth";
import { systemNotificationService } from "../services/system-notification.service";

export async function getBellNotifications() {
  const session = await getSession();
  if (!session) return { notifications: [], unreadCount: 0 };

  return systemNotificationService.getBell(session.userId);
}

export async function markNotificationRead(notificationId: string) {
  const session = await getSession();
  if (!session) return;

  await systemNotificationService.markRead(notificationId, session.userId);
}

export async function getUserNotifications(page = 1, pageSize = 25) {
  const session = await getSession();
  if (!session) return { notifications: [], total: 0, page: 1, pageSize: 25, totalPages: 0 };

  return systemNotificationService.getForUser(session.userId, page, pageSize);
}

export async function markAllNotificationsRead() {
  const session = await getSession();
  if (!session) return;

  await systemNotificationService.markAllRead(session.userId);
}
