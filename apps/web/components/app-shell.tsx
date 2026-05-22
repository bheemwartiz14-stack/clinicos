"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  History,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Palette,
  Shield,
  ShieldCheck,
  Settings,
  Stethoscope,
  UserCog,
  UserRound,
  UsersRound,
  X
} from "lucide-react";
import { useState } from "react";
import { type Permission, filterByPermission } from "@mediclinic/rbac";
import type { SessionUser } from "@mediclinic/auth";
import { logoutAction } from "@modules/auth/actions/auth.actions";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@mediclinic/ui";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  permission?: Permission;
  permissions?: Permission[];
  section?: "Workspace" | "Administration";
  badge?: string;
  children?: NavItem[];
};
const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    permission: "dashboard.view",
    section: "Workspace",
  },
  {
    label: "Patients",
    href: "/patients",
    icon: UserRound,
    permission: "patients.view",
    section: "Workspace",
  },
  {
    label: "Appointments",
    href: "/appointments",
    icon: CalendarDays,
    permission: "appointments.view",
    section: "Workspace",
  },
  {
    label: "Doctors",
    href: "/doctors",
    icon: Stethoscope,
    permission: "doctors.view",
    section: "Workspace",
  },
  {
    label: "Staff",
    href: "/settings/staff-manage",
    icon: UsersRound,
    permission: "staff.manage",
    section: "Administration",
  },
  {
    label: "Access Control",
    href: "/rbac/roles",
    icon: ShieldCheck,
    permission: "rbac.manage",
    section: "Administration",
  },
];

type ShellUser = {
  avatar?: string | null;
  branchName?: string | null;
};

const userMenuItems: Array<{
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  doctorOnly?: boolean;
  adminOnly?: boolean;
}> = [
    { label: "My Profile", href: "/settings/profile", icon: UserRound },
    { label: "Login History", href: "/settings/login-history", icon: History },
  ];

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

function SidebarNav({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const sections = ["Workspace", "Administration"] as const;
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  return (
    <nav className="mt-6 space-y-6" aria-label="Primary navigation">
      <div className="px-2">
        <p className="text-xs font-semibold uppercase tracking-normal text-sidebar-foreground/45">
          Main Menu
        </p>
      </div>
      <div className="space-y-5">
        {sections.map((section) => {
          const sectionItems = items.filter((item) => (item.section ?? "Workspace") === section);
          if (sectionItems.length === 0) return null;
          return (
            <div key={section} className="space-y-2">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-normal text-sidebar-foreground/45">
                {section}
              </p>
              <div className="space-y-1">
                {sectionItems.map((item) => {
                  const visibleChildren = item.children ?? [];
                  const childIsActive = visibleChildren.some((child) => isActivePath(pathname, child.href));
                  const hasChildren = visibleChildren.length > 0;
                  const active = isActivePath(pathname, item.href) || childIsActive;
                  const expanded = expandedItems[item.label] ?? active;
                  const itemClassName = cn(
                    "group flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-sidebar-foreground/76 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    active && "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-sidebar-ring/20 hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                  );
                  const itemContent = (
                    <>
                      <span
                        className={cn(
                          "grid h-7 w-7 shrink-0 place-items-center rounded-md bg-sidebar-accent text-sidebar-foreground/70 transition group-hover:text-sidebar-accent-foreground",
                          active && "bg-sidebar-primary-foreground/15 text-sidebar-primary-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.badge ? (
                        <span
                          className={cn(
                            "rounded-full border border-sidebar-border px-2 py-0.5 text-[10px] font-bold uppercase text-sidebar-foreground/55",
                            active && "border-sidebar-primary-foreground/25 text-sidebar-primary-foreground/85"
                          )}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                      {hasChildren ? (
                        <ChevronRight
                          className={cn("h-3.5 w-3.5 text-sidebar-foreground/35 transition", expanded && "rotate-90", active && "text-sidebar-primary-foreground/70")}
                          aria-hidden
                        />
                      ) : null}
                    </>
                  );

                  return (
                    <div key={item.label} className="space-y-1">
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedItems((current) => ({
                              ...current,
                              [item.label]: !(current[item.label] ?? active),
                            }))
                          }
                          aria-expanded={expanded}
                          className={itemClassName}
                        >
                          {itemContent}
                        </button>
                      ) : (
                        <Link
                          href={item.href as any}
                          prefetch={false}
                          onClick={onNavigate}
                          aria-current={active ? "page" : undefined}
                          className={itemClassName}
                        >
                          {itemContent}
                        </Link>
                      )}

                      {hasChildren && expanded ? (
                        <div className="ml-[26px] space-y-1 border-l border-sidebar-border pl-3">
                          {visibleChildren.map((child) => {
                            const childActive = isActivePath(pathname, child.href);

                            return (
                              <Link
                                key={child.label}
                                href={child.href as any}
                                prefetch={false}
                                onClick={onNavigate}
                                aria-current={childActive ? "page" : undefined}
                                className={cn(
                                  "flex h-9 items-center gap-2 rounded-md px-2.5 text-xs font-medium text-sidebar-foreground/65 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                  childActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                                )}
                              >
                                <child.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                <span className="truncate">{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({ children, session, shellUser }: { children: React.ReactNode; session: SessionUser; shellUser?: ShellUser }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const visibleNavItems = filterByPermission(session.role, navItems);
  const visibleNavItemsWithChildren = visibleNavItems.map((item) => ({
    ...item,
    children: item.children ? filterByPermission(session.role, item.children) : undefined,
  }));
  const userInitials = initials(session.name) || "SA";
  const displayRole = roleLabel(session.role);
  const currentItem = visibleNavItemsWithChildren.find((item) => isActivePath(pathname, item.href) || item.children?.some((child) => isActivePath(pathname, child.href)));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border bg-sidebar px-3.5 py-4 text-sidebar-foreground lg:block">
        <div className="flex h-12 items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/70 px-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-sidebar-ring/20">
            <Activity className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight text-sidebar-foreground">MediClinic Pro</p>
            <p className="truncate text-[11px] leading-tight text-sidebar-foreground/55">{shellUser?.branchName ?? "Clinic workspace"}</p>
          </div>
        </div>
        <SidebarNav items={visibleNavItemsWithChildren} pathname={pathname} />
        <div className="absolute bottom-4 left-3.5 right-3.5 flex items-center gap-2.5 rounded-xl border border-sidebar-border bg-sidebar-accent/80 p-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-foreground text-xs font-semibold text-sidebar">
            {userInitials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-sidebar-accent-foreground">{session.name || displayRole}</p>
            <p className="truncate text-[11px] text-sidebar-foreground/55">{displayRole}</p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/95 px-4 backdrop-blur">
          <div className="flex h-full items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-md lg:hidden" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}>
                <Menu className="h-4 w-4 text-foreground" aria-hidden />
              </Button>
              <div>
                <p className="text-sm font-bold leading-tight text-foreground">{currentItem?.label ?? "Workspace"}</p>
                <p className="text-[11px] leading-tight text-muted-foreground">{shellUser?.branchName ?? "Clinic workspace"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle className="h-8 w-8 border-transparent bg-transparent shadow-none hover:bg-muted [&_svg]:h-4 [&_svg]:w-4" />
              <button type="button" className="relative grid h-8 w-8 place-items-center rounded-md text-foreground transition hover:bg-muted" aria-label="Notifications">
                <Bell className="h-4 w-4" aria-hidden />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="flex h-9 items-center gap-2 rounded-full bg-muted py-1 pl-1 pr-3 text-left transition hover:bg-accent">
                    <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-foreground text-[10px] font-bold text-background">
                      {shellUser?.avatar ? <img src={shellUser.avatar} alt="" className="h-full w-full object-cover" /> : userInitials}
                    </span>
                    <span className="hidden max-w-40 truncate text-xs font-medium text-foreground sm:inline">{session.name || displayRole}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-2">
                  <DropdownMenuLabel className="p-2">
                    <span className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                        {shellUser?.avatar ? <img src={shellUser.avatar} alt="" className="h-full w-full object-cover" /> : userInitials}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">{session.name || displayRole}</span>
                        <span className="block truncate text-xs capitalize text-muted-foreground">{displayRole}</span>
                        <span className="block truncate text-xs text-muted-foreground">{shellUser?.branchName ?? "Clinic workspace"}</span>
                      </span>
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userMenuItems.filter((item) => (!item.doctorOnly || session.role === "doctor") && (!item.adminOnly || session.role === "admin")).map((item) => (
                    <DropdownMenuItem key={item.href} asChild className="cursor-pointer px-2.5 py-2">
                      <Link href={item.href as any} prefetch={false}>
                        <item.icon className="h-4 w-4" aria-hidden />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer px-2.5 py-2"
                    onSelect={(event) => {
                      event.preventDefault();
                      setLogoutOpen(true);
                    }}
                  >
                    <LogOut className="h-4 w-4" aria-hidden />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
          <aside className="h-full w-80 max-w-[88vw] border-r border-sidebar-border bg-sidebar p-3.5 text-sidebar-foreground shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex h-12 min-w-0 items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/70 px-2.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Activity className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-sidebar-foreground">MediClinic Pro</p>
                  <p className="truncate text-[11px] text-sidebar-foreground/55">{shellUser?.branchName ?? "Clinic workspace"}</p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation">
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </div>
            <SidebarNav items={visibleNavItemsWithChildren} pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      ) : null}

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="border border-border bg-card/95 shadow-2xl shadow-foreground/10 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </AlertDialogMedia>
            <AlertDialogTitle>Logout from MediClinic Pro?</AlertDialogTitle>
            <AlertDialogDescription>
              Your secure dashboard session will end on this device. Any unsaved form changes should be saved before you continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay signed in</AlertDialogCancel>
            <form action={logoutAction}>
              <Button type="submit" variant="destructive" className="w-full sm:w-auto">
                <LogOut className="h-4 w-4" aria-hidden />
                Logout
              </Button>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
