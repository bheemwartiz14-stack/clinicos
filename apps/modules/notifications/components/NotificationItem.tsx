"use client";

import { memo } from "react";
import Link from "next/link";
import { cn } from "@mediclinic/ui";
import type { Notification } from "../notification.types";

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: () => void;
  onClose?: () => void;
}

export const NotificationItem = memo(function NotificationItem({
  notification,
  onMarkRead,
  onClose,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead && onMarkRead) {
      onMarkRead();
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Link
      href="/notifications"
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 px-4 py-3 text-left transition hover:bg-muted/50",
        !notification.isRead && "bg-primary/[0.02]",
      )}
    >
      <div className="mt-1.5 shrink-0">
        {!notification.isRead ? (
          <span className="block h-2 w-2 rounded-full bg-primary" />
        ) : (
          <span className="block h-2 w-2 rounded-full bg-transparent" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm leading-snug",
            !notification.isRead && "font-semibold",
          )}
        >
          {notification.subject ?? "Notification"}
        </p>
        {notification.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {notification.description}
          </p>
        )}
        <p className="mt-1 text-[11px] text-muted-foreground/60">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
    </Link>
  );
});

function formatRelativeTime(date: Date | string | null): string {
  if (!date) return "";
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
}
