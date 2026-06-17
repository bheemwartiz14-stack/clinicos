export const NOTIFICATION_ROUTES = {
  list: {
    method: "GET",
    path: "/api/notifications",
    description: "Paginated list of user notifications",
  },
  unreadCount: {
    method: "GET",
    path: "/api/notifications/unread-count",
    description: "Fast unread count for bell badge",
  },
  markAsRead: {
    method: "POST",
    path: "/api/notifications/mark-read",
    description: "Mark single or multiple notifications as read",
  },
  create: {
    method: "POST",
    path: "/api/notifications",
    description: "Create a new notification",
  },
} as const;
