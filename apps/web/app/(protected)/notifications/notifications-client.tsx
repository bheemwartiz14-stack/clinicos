"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCheck, ChevronLeft, ChevronRight, Loader2, MailOpen, Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@mediclinic/ui";
import { toast } from "sonner";

type SystemNotification = {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string | null;
  isRead: boolean;
  createdAt: Date;
};

const typeIcon = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle,
};

const typeColor = {
  info: "text-blue-500",
  warning: "text-amber-500",
  error: "text-red-500",
  success: "text-green-500",
};

export function NotificationsClient() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = 25;

  const fetch = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const { getUserNotifications } = await import("@modules/settings/notifications/actions/notification-bell.actions");
      const data = await getUserNotifications(p, pageSize);
      setNotifications(data.notifications);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch(page);
  }, [page, fetch]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      const { markAllNotificationsRead } = await import("@modules/settings/notifications/actions/notification-bell.actions");
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const { markNotificationRead } = await import("@modules/settings/notifications/actions/notification-bell.actions");
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">
            <Bell className="mr-1 h-3 w-3" />
            Notifications
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight">All Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {total} total{unreadCount > 0 && ` (${unreadCount} unread)`}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <MailOpen className="mr-1.5 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-center text-sm text-muted-foreground">
          <Bell className="h-12 w-12 opacity-20" />
          <p className="font-medium">No notifications yet</p>
          <p>System notifications will appear here.</p>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            {notifications.map((n) => {
              const Icon = typeIcon[n.type];
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition hover:bg-muted/50",
                    !n.isRead ? "border-primary/20 bg-primary/[0.02]" : "border-border",
                  )}
                >
                  <div className="mt-1 shrink-0">
                    {!n.isRead ? (
                      <span className="block h-2 w-2 rounded-full bg-primary" />
                    ) : (
                      <Icon className={cn("h-4 w-4", typeColor[n.type])} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm", !n.isRead && "font-semibold")}>
                      {n.title}
                    </p>
                    {n.message && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                    )}
                    <p className="mt-1 text-[11px] text-muted-foreground/60">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </button>
              );
            })}
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
