"use client";

import {
  Activity,
  Bell,
  CalendarDays,
  ChevronsUpDown,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Pill,
  Receipt,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { hasPermission, type Permission } from "@/modules/auth/permissions";

type SidebarUser = {
  name: string;
  email: string;
};

const nav: Array<{
  label: string;
  href: string;
  icon: React.ElementType;
  permission: Permission;
}> = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard.read",
  },
  {
    label: "Patients",
    href: "/patients",
    icon: Users,
    permission: "patients.read",
  },
  {
    label: "Appointments",
    href: "/appointments",
    icon: CalendarDays,
    permission: "appointments.read",
  },
  {
    label: "Billing",
    href: "/billing",
    icon: Receipt,
    permission: "billing.read",
  },
  {
    label: "Prescriptions",
    href: "/prescriptions",
    icon: ClipboardList,
    permission: "prescriptions.write",
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: Pill,
    permission: "inventory.read",
  },
  {
    label: "AI Notes",
    href: "/ai-notes",
    icon: Activity,
    permission: "ai_notes.read",
  },
  {
    label: "Role Permissions",
    href: "/dashboard/role-permissions",
    icon: ShieldCheck,
    permission: "roles.manage",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    permission: "settings.manage",
  },
];

function getInitials(name?: string | null) {
  if (!name) {
    return "MA";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SidebarUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { user?: SidebarUser | null };
        if (!ignore && data.user) {
          setUser(data.user);
        }
      } catch {
        // Keep the admin fallback when the profile endpoint is unavailable.
      }
    }

    loadUser();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  // temp permissions
  const permissions: Permission[] = [
    "dashboard.read",
    "patients.read",
    "appointments.read",
    "billing.read",
    "prescriptions.write",
    "inventory.read",
    "ai_notes.read",
    "roles.manage",
    "settings.manage",
  ];

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar/95 backdrop-blur-2xl">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-4">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Stethoscope className="size-5" />
          </div>

          <div>
            <h2 className="text-lg font-bold">MediClinic</h2>

            <p className="text-xs text-muted-foreground">AI Dashboard</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav
                .filter((item) => hasPermission(permissions, item.permission))
                .map((item) => {
                  const active = pathname === item.href;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        className={`h-12 rounded-2xl transition-all duration-200 ${
                          active
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}
                      >
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className="size-5" />

                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex min-w-0 items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              type="button"
            >
              <Avatar className="size-9 border border-sidebar-border">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-fuchsia-500 text-xs font-semibold text-white">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">
                  {user?.name ?? "MediClinic Admin"}
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  {user?.email ?? "admin@mediclinic.pro"}
                </p>
              </div>

              <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-60" side="right" sideOffset={10}>
            <DropdownMenuLabel className="flex min-w-0 items-center gap-3 p-2">
              <Avatar className="size-9 border border-border">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-fuchsia-500 text-xs font-semibold text-white">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>

              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-popover-foreground">
                  {user?.name ?? "MediClinic Admin"}
                </span>

                <span className="block truncate text-xs text-muted-foreground">
                  {user?.email ?? "admin@mediclinic.pro"}
                </span>
              </span>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <UserRound className="size-4" />
                Account
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/billing">
                <CreditCard className="size-4" />
                Billing
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Bell className="size-4" />
              Notifications
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem disabled={isLoggingOut} onSelect={handleLogout}>
              <LogOut className="size-4" />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
