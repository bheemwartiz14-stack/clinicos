"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, CheckCheck, Loader2, MailOpen, Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@mediclinic/ui";
import Link from "next/link";

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

export function NotificationBell() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const prevIdsRef = useRef<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { getBellNotifications } = await import("@modules/settings/notifications/actions/notification-bell.actions");
      const data = await getBellNotifications();

      setNotifications((prev) => {
        const prevSet = prevIdsRef.current;
        const currentIds = new Set(data.notifications.map((n) => n.id));

        if (!open && prev.length > 0) {
          const newOnes = data.notifications.filter((n) => !prevSet.has(n.id) && !n.isRead);
          for (const n of newOnes) {
            toast(n.title, {
              description: n.message ?? undefined,
              action: { label: "View", onClick: () => window.location.assign("/notifications") },
              duration: 5000,
            });
          }
        }

        prevIdsRef.current = currentIds;
        return data.notifications;
      });

      setUnreadCount(data.unreadCount);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      fetchNotifications();
      pollRef.current = setInterval(fetchNotifications, 15000);
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [open, fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkRead = useCallback(async (id: string) => {
    try {
      const { markNotificationRead } = await import("@modules/settings/notifications/actions/notification-bell.actions");
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
    }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    try {
      const { markAllNotificationsRead } = await import("@modules/settings/notifications/actions/notification-bell.actions");
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
    }
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-md border-transparent bg-transparent shadow-none hover:bg-muted">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <DropdownMenuLabel className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-semibold">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                ({unreadCount} unread)
              </span>
            )}
          </span>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleMarkAllRead} title="Mark all as read">
                <MailOpen className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchNotifications} title="Refresh">
              <Loader2 className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
              <Link href="/notifications" title="View all">
                <CheckCheck className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {loading && notifications.length === 0 && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loading && notifications.length === 0 && (
            <div className="flex flex-col items-center gap-1 py-6 text-center text-xs text-muted-foreground">
              <Bell className="h-8 w-8 opacity-30" />
              <p className="font-medium">No notifications</p>
              <p>You&apos;re all caught up</p>
            </div>
          )}
          {notifications.map((n) => {
            const Icon = typeIcon[n.type];
            return (
              <DropdownMenuItem
                key={n.id}
                className={cn(
                  "flex flex-col items-start gap-0.5 px-2.5 py-2 cursor-pointer",
                  !n.isRead && "bg-muted/50"
                )}
                onClick={() => handleMarkRead(n.id)}
                asChild
              >
                <Link href="/notifications" className="flex flex-col items-start gap-0.5">
                  <div className="flex items-center gap-2 w-full">
                    {!n.isRead ? (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                    ) : (
                      <Icon className={cn("h-3.5 w-3.5 shrink-0", typeColor[n.type])} />
                    )}
                    <span className={cn("text-xs font-medium", !n.isRead && "font-semibold")}>
                      {n.title}
                    </span>
                  </div>
                  {n.message && (
                    <span className="line-clamp-1 text-[11px] text-muted-foreground pl-4">
                      {n.message}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground/60 pl-4">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer px-2.5 py-2 text-xs text-center" asChild>
          <Link href="/notifications">View all notifications</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
