"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  Banknote,
  Bell,
  Bot,
  Building2,
  CalendarClock,
  ChevronDown,
  FileBarChart,
  HelpCircle,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound
} from "lucide-react";
import { useState } from "react";
import { cn } from "@mediclinic/ui";
import { filterByPermission, type Permission } from "@mediclinic/rbac";
import type { SessionUser } from "@mediclinic/auth";
import { logoutAction } from "@modules/auth/actions/auth.actions";
import { ThemeToggle } from "./theme-toggle";

type NavChild = {
  label: string;
  href: string;
  permission: Permission;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  permission?: Permission;
  children?: NavChild[];
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, permission: "dashboard.view" },
  { label: "Patients", href: "/patients", icon: UsersRound, permission: "patients.view" },
  { label: "Doctors", href: "/doctors", icon: Stethoscope, permission: "doctors.view" },
  { label: "Appointments", href: "/appointments", icon: CalendarClock, permission: "appointments.view" },
  { label: "Billing", href: "/billing", icon: Banknote, permission: "billing.view" },
  { label: "Reports", href: "/reports", icon: FileBarChart, permission: "reports.view" },
  { label: "AI Assistant", href: "/ai", icon: Bot, permission: "ai.use" },
  { label: "Branches", href: "/branches", icon: Building2, permission: "branches.manage" },
  { label: "Staff", href: "/settings/staff-manage", icon: UsersRound, permission: "staff.manage" },
  { label: "RBAC", href: "/rbac", icon: ShieldCheck, permission: "rbac.manage" },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    children: [
      { label: "My Profile", href: "/settings/profile", permission: "settings.profile" },
      { label: "Security", href: "/settings/security", permission: "settings.profile" },
      { label: "Notifications", href: "/settings/notifications", permission: "settings.profile" },
      { label: "Integrations", href: "/settings/integration", permission: "integrations.view" },
      { label: "Branch Settings", href: "/settings/branches", permission: "settings.manage" },
      { label: "Department Settings", href: "/settings/departments", permission: "settings.manage" }
    ]
  }
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

export function AppShell({ children, session, shellUser }: { children: React.ReactNode; session: SessionUser; shellUser?: ShellUser }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const visibleNavItems = navItems
    .map((item) => {
      if (item.children) {
        const visibleChildren = filterByPermission(session.role, item.children);
        if (visibleChildren.length === 0) return null;
        return { ...item, children: visibleChildren };
      }
      return item.permission ? filterByPermission(session.role, [item]).length ? item : null : item;
    })
    .filter((item): item is NavItem => Boolean(item));

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r bg-card/82 px-4 py-5 shadow-xl shadow-teal-950/5 backdrop-blur lg:block">
        <div className="flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold">MediClinic Pro</p>
            <p className="text-xs text-muted-foreground">Single clinic platform</p>
          </div>
        </div>
        <nav className="mt-8 space-y-1" aria-label="Primary">
          {visibleNavItems.map((item, index) => (
            <div key={item.label}>
              <Link
                href={item.href as any}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  index === 0 && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                )}
              >
                <item.icon className="h-4 w-4" aria-hidden={true} />
                {item.label}
              </Link>

              {item.children ? (
                <div className="mt-2 space-y-1 pl-8">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href as any}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-muted hover:text-foreground"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b bg-background/78 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-card lg:hidden" aria-label="Open navigation">
              <Menu className="h-5 w-5 text-foreground" aria-hidden="true" />
            </button>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                aria-label="Global search"
                className="h-11 w-full rounded-lg border bg-card/90 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Search patients, MRNs, appointments, invoices"
              />
            </div>
            <button className="hidden rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm md:inline-flex">
              New Appointment
            </button>
            <ThemeToggle />
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((value) => !value)}
                className="flex items-center gap-3 rounded-lg border bg-card/90 px-2 py-1.5 text-left transition hover:border-primary/40"
                aria-expanded={dropdownOpen}
              >
                <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                  {shellUser?.avatar ? <img src={shellUser.avatar} alt="" className="h-full w-full object-cover" /> : initials(session.name)}
                </span>
                <span className="hidden min-w-0 md:block">
                  <span className="block max-w-36 truncate text-sm font-semibold text-foreground">{session.name}</span>
                  <span className="block max-w-36 truncate text-xs capitalize text-muted-foreground">{session.role} · {shellUser?.branchName ?? "Clinic"}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
              </button>
              {dropdownOpen ? (
                <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-slate-950/10">
                  <div className="flex items-center gap-3 border-b border-border p-4">
                    <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                      {shellUser?.avatar ? <img src={shellUser.avatar} alt="" className="h-full w-full object-cover" /> : initials(session.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-foreground">{session.name}</span>
                      <span className="block truncate text-xs capitalize text-muted-foreground">{session.role}</span>
                      <span className="block truncate text-xs text-muted-foreground">{shellUser?.branchName ?? "MediClinic"}</span>
                    </span>
                  </div>
                  <div className="grid p-2">
                    {[
                      { label: "My Profile", href: "/settings/profile", icon: UserRound },
                      { label: "Account Settings", href: "/settings/account", icon: Settings },
                      { label: "Security", href: "/settings/security", icon: ShieldCheck },
                      { label: "Notifications", href: "/settings/notifications", icon: Bell },
                      { label: "Appearance", href: "/settings/preferences", icon: Palette },
                      { label: "Login History", href: "/settings/login-history", icon: History },
                      { label: "Help & Support", href: "/settings", icon: HelpCircle }
                    ].map((item) => (
                      <Link key={item.label} href={item.href as any} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-foreground">
                        <item.icon className="h-4 w-4" aria-hidden />
                        {item.label}
                      </Link>
                    ))}
                    <form action={logoutAction} className="mt-1 border-t pt-2">
                      <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
                        <LogOut className="h-4 w-4" aria-hidden />
                        Logout
                      </button>
                    </form>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <motion.main
          className="px-4 py-6 md:px-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
