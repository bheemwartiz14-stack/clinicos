"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  Bell,
  CalendarDays,
  ChevronDown,
  Menu,
  Settings,
  Stethoscope,
  UserCog,
  UsersRound
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
  active?: boolean;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: Activity, permission: "dashboard.view", active: true },
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

function SidebarNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav className="mt-7" aria-label="Primary">
      <p className="px-2 text-[12px] font-bold text-black">Main Menu</p>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href as any}
            onClick={onNavigate}
            className={cn(
              "flex h-[34px] items-center gap-3 rounded-md px-2.5 text-[12px] font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-black",
              item.active && "bg-cyan-700 text-white hover:bg-cyan-700 hover:text-white"
            )}
          >
            <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {!item.active ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-current" aria-hidden /> : null}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function AppShell({ children, session }: { children: React.ReactNode; session: SessionUser; shellUser?: ShellUser }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const visibleNavItems = filterByPermission(session.role, navItems);
  const userInitials = initials(session.name) || "SA";
  const displayRole = roleLabel(session.role);

  return (
    <div className="min-h-screen bg-white text-black">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[188px] border-r border-zinc-200 bg-white px-3 py-2 lg:block">
        <div className="flex h-[34px] items-center gap-2">
          <div className="grid h-[26px] w-[26px] place-items-center rounded-md bg-cyan-500 text-white">
            <Activity className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold leading-tight text-black">MediClinic Pro</p>
            <p className="truncate text-[10px] leading-tight text-zinc-500">Modern Clinic Management ...</p>
          </div>
        </div>
        <SidebarNav items={visibleNavItems} />
        <div className="absolute bottom-3 left-3 grid h-7 w-7 place-items-center rounded-full bg-zinc-800 text-[13px] font-semibold text-white ring-2 ring-zinc-400">
          N
        </div>
      </aside>

      <div className="lg:pl-[188px]">
        <header className="sticky top-0 z-30 h-[46px] border-b border-zinc-200 bg-white px-4">
          <div className="flex h-full items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-md" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}>
                <Menu className="h-4 w-4 text-black" aria-hidden />
              </Button>
              <div>
                <p className="text-[14px] font-bold leading-tight text-black">Dashboard</p>
                <p className="text-[10px] leading-tight text-zinc-500">Clinic workspace</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle className="h-7 w-7 border-transparent bg-transparent shadow-none hover:bg-zinc-100 [&_svg]:h-4 [&_svg]:w-4" />
              <button type="button" className="relative grid h-7 w-7 place-items-center rounded-md text-black transition hover:bg-zinc-100" aria-label="Notifications">
                <Bell className="h-4 w-4" aria-hidden />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-cyan-700" />
              </button>
              <button type="button" className="flex h-[34px] items-center gap-2 rounded-full bg-zinc-100 py-1 pl-1 pr-3 text-left">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-black text-[10px] font-bold text-white">{userInitials}</span>
                <span className="hidden text-[12px] font-medium text-black sm:inline">{session.name || displayRole}</span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
              </button>
            </div>
          </div>
        </header>

        <motion.main
          className="px-[18px] py-[18px]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {children}
        </motion.main>
      </div>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm lg:hidden">
          <aside className="h-full w-72 max-w-[86vw] border-r border-zinc-200 bg-white p-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex h-[34px] items-center gap-2">
                <div className="grid h-[26px] w-[26px] place-items-center rounded-md bg-cyan-500 text-white">
                  <Activity className="h-4 w-4" aria-hidden />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-black">MediClinic Pro</p>
                  <p className="text-[10px] text-zinc-500">Modern Clinic Management</p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation">
                <Menu className="h-4 w-4" aria-hidden />
              </Button>
            </div>
            <SidebarNav items={visibleNavItems} onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
