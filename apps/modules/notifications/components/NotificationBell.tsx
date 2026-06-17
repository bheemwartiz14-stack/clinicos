"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUnreadCount } from "../hooks/notifications/useUnreadCount";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationDropdown } from "./NotificationDropdown";

function UnreadBadge() {
  const { data, isLoading } = useUnreadCount();
  const unreadCount = data?.unreadCount ?? 0;

  if (isLoading || unreadCount === 0) return null;

  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold leading-none text-destructive-foreground">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 shrink-0 rounded-md border-transparent bg-transparent shadow-none hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {mounted && <UnreadBadge />}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0"
      >
        <NotificationDropdown onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
