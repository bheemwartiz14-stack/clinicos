import type { InferSelectModel } from "drizzle-orm";
import { notificationLog } from "@mediclinic/db";

export type Notification = InferSelectModel<typeof notificationLog>;

export type NotificationStatus = "queued" | "sent" | "failed";

export type NotificationFilter = "all" | "read" | "unread";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface MarkAsReadInput {
  ids: string[];
}
