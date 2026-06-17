"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type {
  Notification,
  NotificationFilter,
  PaginatedResponse,
} from "../../notification.types";

interface UseNotificationsParams {
  page?: number;
  pageSize?: number;
  filter?: NotificationFilter;
}

async function fetchNotifications(
  params: UseNotificationsParams,
): Promise<PaginatedResponse<Notification>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.filter && params.filter !== "all")
    searchParams.set("filter", params.filter);

  const res = await fetch(`/api/notifications?${searchParams.toString()}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch" }));
    throw new Error(error.error ?? "Failed to fetch notifications");
  }

  return res.json();
}

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params: UseNotificationsParams) =>
    ["notifications", "list", params] as const,
};

export function useNotifications(
  params: UseNotificationsParams = {},
  options?: Partial<
    UseQueryOptions<
      PaginatedResponse<Notification>,
      Error,
      PaginatedResponse<Notification>,
      ReturnType<typeof notificationKeys.list>
    >
  >,
) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => fetchNotifications(params),
    staleTime: 30 * 1000,
    ...options,
  });
}
