"use client";

import { useCallback } from "react";
import { Bell, Loader2, MailOpen, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useNotifications } from "../hooks/notifications/useNotifications";
import { useMarkAsRead } from "../hooks/notifications/useMarkAsRead";
import { NotificationItem } from "./NotificationItem";
import type { Notification } from "../notification.types";

const DROPDOWN_PAGE_SIZE = 5;

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useNotifications({
    page: 1,
    pageSize: DROPDOWN_PAGE_SIZE,
    filter: "all",
  });

  const markAsRead = useMarkAsRead();

  const notifications: Notification[] = data?.data ?? [];

  const handleMarkAllRead = useCallback(() => {
    if (notifications.length === 0) return;
    const unreadIds = notifications
      .filter((n: Notification) => !n.isRead)
      .map((n: Notification) => n.id);
    if (unreadIds.length > 0) {
      markAsRead.mutate(unreadIds);
    }
  }, [notifications, markAsRead]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <span className="text-sm font-semibold">
          Notifications
          {data && (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              ({data.total})
            </span>
          )}
        </span>
        <div className="flex items-center gap-0.5">
          {notifications.some((n: Notification) => !n.isRead) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleMarkAllRead}
              disabled={markAsRead.isPending}
              title="Mark all as read"
            >
              <MailOpen className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      <div className="max-h-[320px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-1 py-8 text-center text-xs text-muted-foreground">
            <p className="font-medium">Failed to load</p>
            <Button variant="link" size="sm" onClick={() => refetch()} className="h-auto p-0 text-xs">
              Try again
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-8 text-center text-xs text-muted-foreground">
            <Bell className="h-8 w-8 opacity-30" />
            <p className="font-medium">No notifications</p>
            <p>You&apos;re all caught up</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification: Notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={() => markAsRead.mutate([notification.id])}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t">
        <Button
          variant="ghost"
          className="w-full justify-center rounded-none py-2.5 text-xs text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href="/notifications" onClick={onClose}>
            View all notifications
          </Link>
        </Button>
      </div>
    </div>
  );
}
