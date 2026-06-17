"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Notification } from "../../notification.types";
import { notificationKeys } from "./useNotifications";
import { unreadCountKeys } from "./useUnreadCount";

interface CreateNotificationInput {
  subject?: string;
  description?: string;
  body?: string;
  userId: string;
  status?: "queued" | "sent" | "failed";
}

async function createNotification(
  input: CreateNotificationInput,
): Promise<Notification> {
  const res = await fetch("/api/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to create" }));
    throw new Error(error.error ?? "Failed to create notification");
  }

  return res.json();
}

export function useCreateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNotification,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: unreadCountKeys.all });
    },
  });
}
