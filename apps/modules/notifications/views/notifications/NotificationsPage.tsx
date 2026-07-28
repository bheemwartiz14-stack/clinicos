"use client";

import { useState, useCallback } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MailOpen,
  CheckCheck,
  RefreshCw,
  Inbox,
  BellRing,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-6 rounded-full bg-primary/5" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">
              <BellRing className="mr-1 h-3 w-3" />
              Notifications
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight">All Notifications</h1>
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
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
              <Bell className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="truncate text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold tabular-nums">{total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 text-emerald-600">
              <BellRing className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="truncate text-sm text-muted-foreground">Unread</p>
              <p className="text-2xl font-bold tabular-nums">{unreadCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 text-amber-600">
              <Inbox className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="truncate text-sm text-muted-foreground">Read</p>
              <p className="text-2xl font-bold tabular-nums">{total - unreadCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-1 rounded-lg border p-1 w-fit bg-muted/30">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleFilterChange(opt.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              filter === opt.value
                ? "bg-primary text-primary-foreground shadow-sm"
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
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted">
            <Bell className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold">Failed to load notifications</h3>
          <Button variant="link" onClick={() => refetch()} className="h-auto p-0 text-xs">
            Try again
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted">
            <Bell className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold">No notifications yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {filter === "all"
              ? "Notifications will appear here."
              : filter === "unread"
                ? "No unread notifications."
                : "No read notifications."}
          </p>
        </div>
      ) : (
        <Card className="overflow-hidden border shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y">
              {notifications.map((n: Notification) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  disabled={markAsRead.isPending}
                  className={cn(
                    "flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/10 disabled:opacity-70",
                    !n.isRead ? "bg-primary/[0.02]" : "",
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    {!n.isRead ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                        <span className="block h-2 w-2 rounded-full bg-primary" />
                      </span>
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                        <CheckCheck className="h-3 w-3 text-muted-foreground/40" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm", !n.isRead && "font-semibold")}>
                      {n.subject ?? "Notification"}
                    </p>
                    {n.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {n.description}
                      </p>
                    )}
                    <p className="mt-1.5 text-[11px] text-muted-foreground/60">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm tabular-nums text-muted-foreground">
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
    </div>
  );
}
