"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  Bell,
  CalendarDays,
  Menu,
  Settings,
  Stethoscope,
  UserCog,
  X
} from "lucide-react";
import { useState } from "react";
import { type Permission, filterByPermission } from "@mediclinic/rbac";
import type { SessionUser } from "@mediclinic/auth";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@mediclinic/ui";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  permission: Permission;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: Activity, permission: "dashboard.view" },
  { label: "Staff Management", href: "/settings/staff-manage", icon: UserCog, permission: "staff.manage" },
  { label: "Doctor", href: "/doctors", icon: Stethoscope, permission: "doctors.view" },
  { label: "Appointments", href: "/appointments", icon: CalendarDays, permission: "appointments.view" },
  { label: "System & Admin", href: "/settings", icon: Settings, permission: "settings.manage" }
];

type ShellUser = {
  avatar?: string | null;
  branchName?: string | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function roleLabel(role: string) {
  return role
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNav({ items, pathname, onNavigate }: { items: NavItem[]; pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="mt-7" aria-label="Primary">
      <p className="px-2 text-xs font-semibold uppercase tracking-normal text-slate-500">Main Menu</p>
      <div className="mt-4 space-y-2">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.label}
              href={item.href as any}
              prefetch={false}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-9 items-center gap-3 rounded-md px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950",
                active && "bg-sky-700 text-white hover:bg-sky-700 hover:text-white"
              )}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({ children, session, shellUser }: { children: React.ReactNode; session: SessionUser; shellUser?: ShellUser }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const visibleNavItems = filterByPermission(session.role, navItems);
  const userInitials = initials(session.name) || "SA";
  const displayRole = roleLabel(session.role);
  const currentItem = visibleNavItems.find((item) => isActivePath(pathname, item.href));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[208px] border-r border-slate-200 bg-white px-3 py-3 lg:block">
        <div className="flex h-10 items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-sky-700 text-white">
            <Activity className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight text-slate-950">MediClinic Pro</p>
            <p className="truncate text-[11px] leading-tight text-slate-500">{shellUser?.branchName ?? "Clinic workspace"}</p>
          </div>
        </div>
        <SidebarNav items={visibleNavItems} pathname={pathname} />
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-xs font-semibold text-white">
            {userInitials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-950">{session.name || displayRole}</p>
            <p className="truncate text-[11px] text-slate-500">{displayRole}</p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[208px]">
        <header className="sticky top-0 z-30 h-14 border-b border-slate-200 bg-white/95 px-4 backdrop-blur">
          <div className="flex h-full items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-md lg:hidden" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}>
                <Menu className="h-4 w-4 text-slate-950" aria-hidden />
              </Button>
              <div>
                <p className="text-sm font-bold leading-tight text-slate-950">{currentItem?.label ?? "Workspace"}</p>
                <p className="text-[11px] leading-tight text-slate-500">{shellUser?.branchName ?? "Clinic workspace"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle className="h-8 w-8 border-transparent bg-transparent shadow-none hover:bg-slate-100 [&_svg]:h-4 [&_svg]:w-4" />
              <button type="button" className="relative grid h-8 w-8 place-items-center rounded-md text-slate-950 transition hover:bg-slate-100" aria-label="Notifications">
                <Bell className="h-4 w-4" aria-hidden />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-sky-700" />
              </button>
              <button type="button" className="flex h-9 items-center gap-2 rounded-full bg-slate-100 py-1 pl-1 pr-3 text-left">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-950 text-[10px] font-bold text-white">{userInitials}</span>
                <span className="hidden max-w-40 truncate text-xs font-medium text-slate-950 sm:inline">{session.name || displayRole}</span>
              </button>
            </div>
          </div>
        </header>

        <motion.main
          className="px-4 py-5 sm:px-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {children}
        </motion.main>
      </div>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm lg:hidden">
          <aside className="h-full w-72 max-w-[86vw] border-r border-slate-200 bg-white p-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex h-10 items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-md bg-sky-700 text-white">
                  <Activity className="h-4 w-4" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-950">MediClinic Pro</p>
                  <p className="text-[11px] text-slate-500">{shellUser?.branchName ?? "Clinic workspace"}</p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation">
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </div>
            <SidebarNav items={visibleNavItems} pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
