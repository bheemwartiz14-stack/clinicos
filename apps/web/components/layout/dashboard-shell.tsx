import { hasPermission, type Permission } from "@mediclinicpro/types";
import { Badge } from "@mediclinicpro/ui/components/badge";
import { Button } from "@mediclinicpro/ui/components/button";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Pill,
  Receipt,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { NetworkStatus } from "@/components/pwa/network-status";
import { getCurrentUser } from "@/lib/server/auth";

const nav: Array<{
  label: string;
  href: string;
  icon: React.ElementType;
  permission: Permission;
}> = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard.read" },
  { label: "Patients", href: "/patients", icon: Users, permission: "patients.read" },
  {
    label: "Appointments",
    href: "/appointments",
    icon: CalendarDays,
    permission: "appointments.read",
  },
  { label: "Billing", href: "/billing", icon: Receipt, permission: "billing.read" },
  {
    label: "Prescriptions",
    href: "/prescriptions",
    icon: ClipboardList,
    permission: "prescriptions.write",
  },
  { label: "Inventory", href: "/inventory", icon: Pill, permission: "inventory.read" },
  { label: "AI Notes", href: "/ai-notes", icon: Activity, permission: "ai_notes.read" },
  {
    label: "Role Permissions",
    href: "/dashboard/role-permissions",
    icon: ShieldCheck,
    permission: "roles.manage",
  },
  { label: "Settings", href: "/settings", icon: Settings, permission: "settings.manage" },
];

export async function DashboardShell({
  title,
  breadcrumb,
  activeHref = "/dashboard",
  children,
}: {
  title: string;
  breadcrumb: string[];
  activeHref?: string;
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const visibleNav = user
    ? nav.filter((item) => hasPermission(user.role, item.permission))
    : nav.filter((item) => item.permission === "dashboard.read");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="border-b border-slate-200 p-5">
          <p className="text-lg font-semibold">MediClinic Pro</p>
          <p className="text-sm text-slate-500">Enterprise clinic suite</p>
          {user ? (
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-slate-700">{user.name}</p>
              <Badge className="capitalize">{user.role}</Badge>
            </div>
          ) : null}
        </div>
        <nav className="grid gap-1 p-3">
          {visibleNav.map((item) => {
            const isActive = activeHref === item.href;

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={[
                  "flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm transition-colors",
                  isActive
                    ? "bg-teal-50 font-medium text-teal-800"
                    : "text-slate-700 hover:bg-slate-100",
                ].join(" ")}
                href={item.href}
                key={item.label}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
          <div>
            <div className="text-xs text-slate-500">{breadcrumb.join(" / ")}</div>
            <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <NetworkStatus />
            <Button size="sm">New appointment</Button>
          </div>
        </header>
        <main className="grid gap-4 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
