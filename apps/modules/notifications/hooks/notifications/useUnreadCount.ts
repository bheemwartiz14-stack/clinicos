"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { UnreadCountResponse } from "../../notification.types";

async function fetchUnreadCount(): Promise<UnreadCountResponse> {
  const res = await fetch("/api/notifications/unread-count", {
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch" }));
    throw new Error(error.error ?? "Failed to fetch unread count");
  }

  return res.json();
}

export const unreadCountKeys = {
  all: ["notifications", "unreadCount"] as const,
};

export function useUnreadCount(
  options?: Partial<
    UseQueryOptions<
      UnreadCountResponse,
      Error,
      UnreadCountResponse,
      typeof unreadCountKeys.all
    >
  >,
) {
  return useQuery({
    queryKey: unreadCountKeys.all,
    queryFn: fetchUnreadCount,
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
    ...options,
  });
}
