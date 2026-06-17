"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Notification, PaginatedResponse, UnreadCountResponse } from "../../notification.types";
import { notificationKeys } from "./useNotifications";
import { unreadCountKeys } from "./useUnreadCount";

async function markAsRead(ids: string[]): Promise<void> {
  const res = await fetch("/api/notifications/mark-read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to mark as read" }));
    throw new Error(error.error ?? "Failed to mark notifications as read");
  }
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,

    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const previousQueries = queryClient.getQueriesData<PaginatedResponse<Notification>>({
        queryKey: notificationKeys.all,
      }) as [unknown, PaginatedResponse<Notification> | undefined][];

      for (const [queryKey, data] of previousQueries) {
        if (data) {
          queryClient.setQueryData<PaginatedResponse<Notification>>(queryKey as readonly unknown[], {
            ...data,
            data: data.data.map((n: Notification) =>
              ids.includes(n.id) ? { ...n, isRead: true, readAt: new Date().toISOString() as unknown as Date } : n,
            ),
          });
        }
      }

      const prevUnread = queryClient.getQueryData<UnreadCountResponse>(unreadCountKeys.all);
      if (prevUnread) {
        queryClient.setQueryData<UnreadCountResponse>(unreadCountKeys.all, {
          unreadCount: Math.max(0, prevUnread.unreadCount - ids.length),
        });
      }

      return { previousQueries, prevUnread };
    },

    onError: (
      _err: Error,
      _ids: string[],
      context?: { previousQueries: [unknown, PaginatedResponse<Notification> | undefined][]; prevUnread: UnreadCountResponse | undefined },
    ) => {
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey as readonly unknown[], data);
        }
      }
      if (context?.prevUnread) {
        queryClient.setQueryData(unreadCountKeys.all, context.prevUnread);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: unreadCountKeys.all });
    },
  });
}
