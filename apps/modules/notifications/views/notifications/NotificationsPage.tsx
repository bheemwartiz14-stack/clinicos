"use client";

import { useState, useCallback } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MailOpen,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@mediclinic/ui";
import toast from "react-hot-toast";
import { useNotifications } from "../../hooks/notifications/useNotifications";
import { useUnreadCount } from "../../hooks/notifications/useUnreadCount";
import { useMarkAsRead } from "../../hooks/notifications/useMarkAsRead";
import type { Notification, NotificationFilter } from "../../notification.types";

const PAGE_SIZE = 20;

const FILTER_OPTIONS: { label: string; value: NotificationFilter }[] = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
];

export function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const { data, isLoading, isError, refetch } = useNotifications({
    page,
    pageSize: PAGE_SIZE,
    filter,
  });

  const { data: unreadData } = useUnreadCount();
  const markAsRead = useMarkAsRead();

  const notifications: Notification[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  const handleMarkAllRead = useCallback(() => {
    if (notifications.length === 0) return;
    const unreadIds = notifications
      .filter((n: Notification) => !n.isRead)
      .map((n: Notification) => n.id);
    if (unreadIds.length === 0) {
      toast("No unread notifications");
      return;
    }
    markAsRead.mutate(unreadIds, {
      onSuccess: () => toast.success("All marked as read"),
      onError: () => toast.error("Failed to mark all as read"),
    });
  }, [notifications, markAsRead]);

  const handleMarkRead = useCallback(
    (id: string) => {
      markAsRead.mutate([id], {
        onError: () => toast.error("Failed to mark as read"),
      });
    },
    [markAsRead],
  );

  const handleFilterChange = useCallback((newFilter: NotificationFilter) => {
    setFilter(newFilter);
    setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge
            variant="outline"
            className="mb-3 border-primary/20 bg-primary/5 text-primary"
          >
            <Bell className="mr-1 h-3 w-3" />
            Notifications
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight">
            All Notifications
          </h1>
          <p className="text-sm text-muted-foreground">
            {total} total{unreadCount > 0 ? ` (${unreadCount} unread)` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markAsRead.isPending}
            >
              <MailOpen className="mr-1.5 h-4 w-4" />
              Mark all read
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => refetch()}
            disabled={isLoading}
            title="Refresh"
          >
            <Loader2 className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg border p-1 w-fit">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleFilterChange(opt.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition",
              filter === opt.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 py-20 text-center text-sm text-muted-foreground">
          <Bell className="h-12 w-12 opacity-20" />
          <p className="font-medium">Failed to load notifications</p>
          <Button variant="link" onClick={() => refetch()} className="h-auto p-0 text-xs">
            Try again
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-center text-sm text-muted-foreground">
          <Bell className="h-12 w-12 opacity-20" />
          <p className="font-medium">No notifications yet</p>
          <p>
            {filter === "all"
              ? "Notifications will appear here."
              : filter === "unread"
                ? "No unread notifications."
                : "No read notifications."}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            {notifications.map((n: Notification) => (
              <button
                key={n.id}
                type="button"
                onClick={() => !n.isRead && handleMarkRead(n.id)}
                disabled={markAsRead.isPending}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition hover:bg-muted/50 disabled:opacity-70",
                  !n.isRead
                    ? "border-primary/20 bg-primary/[0.02]"
                    : "border-border",
                )}
              >
                <div className="mt-1 shrink-0">
                  {!n.isRead ? (
                    <span className="block h-2 w-2 rounded-full bg-primary" />
                  ) : (
                    <CheckCheck className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm",
                      !n.isRead && "font-semibold",
                    )}
                  >
                    {n.subject ?? "Notification"}
                  </p>
                  {n.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {n.description}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-muted-foreground/60">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
