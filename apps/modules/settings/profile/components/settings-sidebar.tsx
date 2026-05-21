"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Calendar, CalendarClock, Clock, History, Link2, LockKeyhole, Palette, Settings, Shield, Timer, UserCog, UserRound } from "lucide-react";
import type { Role } from "@mediclinic/rbac";
import { cn } from "@mediclinic/ui";

interface NavItem {
  label: string;
  href: string;
  icon: typeof UserRound;
}

const items: NavItem[] = [
  { label: "Profile", href: "/settings/profile", icon: UserRound },
  { label: "Security", href: "/settings/security", icon: LockKeyhole },
  { label: "Preferences", href: "/settings/preferences", icon: Palette },
  { label: "Notifications", href: "/settings/notifications", icon: Bell },
  { label: "Account", href: "/settings/account", icon: Settings },
  { label: "Login History", href: "/settings/login-history", icon: History }
];

const doctorItems: NavItem[] = [
  { label: "Integrations", href: "/settings/integration", icon: Link2 }
];
const adminItems: NavItem[] = [
  { label: "Roles & Permissions", href: "/rbac/roles", icon: UserCog }
];
export function SettingsSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const visibleItems = [...items, ...(role === "doctor" ? doctorItems : []), ...(role === "admin" ? adminItems : [])];
  return (
    <aside className="rounded-xl border border-border bg-card/80 p-2 shadow-lg shadow-foreground/5 backdrop-blur lg:sticky lg:top-24">
      <div className="mb-2 flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground">
        <Shield className="h-4 w-4 text-primary" aria-hidden />
        Settings
      </div>
      <nav className="grid gap-1" aria-label="Settings">
        {visibleItems.map((item, idx) => (
          <Link
            key={`${item.href}-${idx}`}
            href={item.href as any}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary",
              pathname === item.href && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            )}
          >
            <item.icon className="h-4 w-4" aria-hidden />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
