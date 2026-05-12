// src/components/dashboard-sidebar.tsx

"use client";

import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CalendarX2,
  ChevronDown,
  ChevronsUpDown,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Monitor,
  MonitorCog,
  Moon,
  PlusCircle,
  Settings,
  ShieldCheck,
  Stethoscope,
  Sun,
  UserRound,
  Users,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";

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
import { logoutAction } from "@/modules/auth/auth.actions";
import { hasAnyPermission, hasPermission, type Permission } from "@/modules/auth/permissions";
import type { WorkspaceSettings } from "./protected-workspace";
export type SidebarUser = {
  name: string;
  email: string;
  permissions: string[];
  role: "admin" | "doctor" | "receptionist" | string;
};
type SingleMenu = {
  type: "single";
  label: string;
  href: string;
  icon: ElementType;
  permission: Permission;
};
type SubMenu = {
  type?: "link";
  label: string;
  href: string;
  icon?: ElementType;
  permission: Permission;
};
type SectionMenu = {
  type: "section";
  label: string;
  icon?: ElementType;
  permissions: Permission[];
  children: SubMenu[];
};
type GroupMenu = {
  type: "group";
  label: string;
  icon: ElementType;
  permissions: Permission[];
  children: Array<SubMenu | SectionMenu>;
};

type SidebarMenuItemType = SingleMenu | GroupMenu;

const sidebarMenus: SidebarMenuItemType[] = [
  {
    type: "single",
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard.view",
  },
  {
    type: "group",
    label: "Doctor",
    icon: Stethoscope,
    permissions: ["doctors.view", "doctors.create"],
    children: [
      {
        label: "All Departments",
        href: "/doctors/department",
        icon: Building2,
        permission: "departments.view",
      }, {
        label: "All Doctors",
        href: "/doctors/view",
        icon: Users,
        permission: "doctors.view",
      },
      {
        label: "Add Doctor",
        href: "/doctors/add-doctor",
        icon: UserRound,
        permission: "doctors.create",
      }
    ],
  },

  {
    type: "group",
    label: "Patients",
    icon: Users,
    permissions: ["patients.view", "patients.create"],
    children: [
      {
        label: "All Patients",
        href: "/patients/view",
        icon: Users,
        permission: "patients.view",
      },
      {
        label: "Add Patient",
        href: "/patients/add-patient",
        icon: UserRound,
        permission: "patients.create",
      },
    ],
  },
  {
    type: "group",
    label: "System & Admin",
    icon: Settings,
    permissions: [
      "settings.manage",
      "general-settings.view",
      "audit-logs.view",
      "login-history.view",
      "roles.manage",
      "departments.manage",
      "branches.view",
      "users.manage",
    ],
    children: [
      {
        label: "System Settings",
        href: "/setting/genral-setting",
        icon: MonitorCog,
        permission: "general-settings.view",
      },
      {
        label: "Roles & Permissions",
        href: "/setting/roles-permissions",
        icon: ShieldCheck,
        permission: "roles.manage",
      },
      {
        label: "Clinic / Branch Setup",
        href: "/setting/branches",
        icon: Building2,
        permission: "branches.view",
      },
      {
        label: "User Management",
        href: "/setting/users",
        icon: Users,
        permission: "users.manage",
      },
      {
        label: "Audit Logs",
        href: "/setting/audit-logs",
        icon: ClipboardList,
        permission: "audit-logs.view",
      },
      {
        label: "Login History",
        href: "/setting/login-history",
        icon: Monitor,
        permission: "login-history.view",
      },
    ],
  },
];

function getInitials(name?: string | null) {
  if (!name) return "MA";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function isHrefActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isMenuActive(pathname: string, menu: SidebarMenuItemType) {
  if (menu.type === "single") {
    return isHrefActive(pathname, menu.href);
  }

  return menu.children.some((child) => {
    if (child.type === "section") {
      return child.children.some((sectionChild) => isHrefActive(pathname, sectionChild.href));
    }

    return isHrefActive(pathname, child.href);
  });
}

function filterGroupChildren(children: GroupMenu["children"], permissions: readonly string[]) {
  return children
    .map((child) => {
      if (child.type === "section") {
        const visibleChildren = child.children.filter((sectionChild) =>
          hasPermission(permissions, sectionChild.permission),
        );

        const canShowSection =
          visibleChildren.length > 0 || hasAnyPermission(permissions, child.permissions);

        if (!canShowSection) return null;

        return {
          ...child,
          children: visibleChildren,
        };
      }

      return hasPermission(permissions, child.permission) ? child : null;
    })
    .filter(Boolean) as GroupMenu["children"];
}

export function DashboardSidebar({
  settings,
  user,
}: {
  settings: WorkspaceSettings;
  user: SidebarUser;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const companyName = settings.companyName ?? "MediClinic";
  const workspaceLabel = settings.tagline ?? "System Workspace";
  const mainLogo = settings.mainLogo;
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "Patient Module": false,
    "System & Admin": false,
  });

  const permissions = useMemo(() => {
    return user.permissions ?? [];
  }, [user]);

  const visibleMenus = useMemo(() => {
    return sidebarMenus
      .map((menu) => {
        if (menu.type === "single") {
          return hasPermission(permissions, menu.permission) ? menu : null;
        }

        const visibleChildren = filterGroupChildren(menu.children, permissions);
        const canShowGroup =
          visibleChildren.length > 0 || hasAnyPermission(permissions, menu.permissions);

        if (!canShowGroup) return null;

        return {
          ...menu,
          children: visibleChildren,
        };
      })
      .filter(Boolean) as SidebarMenuItemType[];
  }, [permissions]);

  useEffect(() => {
    const activeGroups = visibleMenus.reduce<Record<string, boolean>>((acc, menu) => {
      if (menu.type === "group" && isMenuActive(pathname, menu)) {
        acc[menu.label] = true;
      }

      return acc;
    }, {});

    setOpenMenus((prev) => ({
      ...prev,
      ...activeGroups,
    }));
  }, [pathname, visibleMenus]);

  async function handleLogout() {
    setIsLoggingOut(true);
    await logoutAction();
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <Sidebar className="border-r border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <div className="flex h-full bg-white dark:bg-slate-950">
        <div className="flex min-w-0 flex-1 flex-col">
          <SidebarHeader className="h-[77px] justify-center border-b border-slate-200 px-5 dark:border-slate-800">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-950 dark:text-blue-400">
                {mainLogo ? (
                  <img
                    src={mainLogo}
                    alt={`${companyName} logo`}
                    className="max-h-8 max-w-8 object-contain"
                  />
                ) : (
                  <Stethoscope className="size-5" />
                )}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-slate-900 dark:text-white">
                  {companyName}
                </h2>

                <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                  {workspaceLabel}
                </p>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent className="px-3 py-4">
            <SidebarGroup>
              <div className="mb-5 px-3 text-sm font-bold tracking-wide text-slate-900 dark:text-slate-100">
                Main Menu
              </div>

              <SidebarGroupContent>
                <SidebarMenu className="gap-2">
                  {visibleMenus.map((menu) => {
                    const active = isMenuActive(pathname, menu);
                    const Icon = menu.icon;

                    if (menu.type === "single") {
                      return (
                        <SidebarMenuItem key={menu.href}>
                          <SidebarMenuButton
                            asChild
                            className={`h-11 rounded-lg px-3 transition-all duration-200 ${active
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 dark:bg-blue-500"
                              : "text-slate-700 hover:bg-slate-100 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-blue-400"
                              }`}
                          >
                            <Link href={menu.href} className="flex items-center gap-3">
                              <Icon className="size-4" />
                              <span className="font-semibold">{menu.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    }

                    const isOpen = openMenus[menu.label] ?? active;

                    return (
                      <SidebarMenuItem key={menu.label}>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenus((prev) => ({
                              ...prev,
                              [menu.label]: !(prev[menu.label] ?? active),
                            }))
                          }
                          className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-all ${active
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                            : "text-slate-700 hover:bg-slate-100 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-blue-400"
                            }`}
                        >
                          <Icon className="size-4 shrink-0" />

                          <span className="flex-1 text-left">{menu.label}</span>

                          <ChevronDown
                            className={`size-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""
                              }`}
                          />
                        </button>

                        {isOpen ? (
                          <div className="ml-6 mt-1 space-y-1 border-l border-slate-200 pl-4 dark:border-slate-800">
                            {menu.children.map((child) => {
                              if (child.type === "section") {
                                const SectionIcon = child.icon;
                                const childActive = child.children.some((sectionChild) =>
                                  isHrefActive(pathname, sectionChild.href),
                                );

                                return (
                                  <div key={child.label} className="space-y-1 pt-2 first:pt-1">
                                    <div
                                      className={`flex h-8 items-center gap-2 rounded-lg px-2 text-xs font-semibold uppercase tracking-wide ${childActive
                                        ? "text-blue-700 dark:text-blue-400"
                                        : "text-slate-400 dark:text-slate-500"
                                        }`}
                                    >
                                      {SectionIcon ? <SectionIcon className="size-3.5" /> : null}
                                      <span className="truncate">{child.label}</span>
                                    </div>

                                    <div className="space-y-1">
                                      {child.children.map((sectionChild) => {
                                        const sectionChildActive = isHrefActive(
                                          pathname,
                                          sectionChild.href,
                                        );

                                        return (
                                          <Link
                                            key={sectionChild.href}
                                            href={sectionChild.href}
                                            className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-all ${sectionChildActive
                                              ? "bg-blue-100 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                                              : "text-slate-500 hover:bg-slate-100 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-blue-400"
                                              }`}
                                          >
                                            <span
                                              className={`size-1.5 shrink-0 rounded-full ${sectionChildActive
                                                ? "bg-blue-600 dark:bg-blue-400"
                                                : "bg-slate-300 dark:bg-slate-600"
                                                }`}
                                            />

                                            <span className="truncate">{sectionChild.label}</span>
                                          </Link>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              }

                              const childActive = isHrefActive(pathname, child.href);

                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-all ${childActive
                                    ? "bg-blue-100 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                                    : "text-slate-500 hover:bg-slate-100 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-blue-400"
                                    }`}
                                >
                                  <span
                                    className={`size-1.5 shrink-0 rounded-full ${childActive
                                      ? "bg-blue-600 dark:bg-blue-400"
                                      : "bg-slate-300 dark:bg-slate-600"
                                      }`}
                                  />

                                  <span className="truncate">{child.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        ) : null}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4 dark:border-slate-800">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex min-w-0 items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-900"
                  type="button"
                >
                  <Avatar className="size-9 border border-slate-200 dark:border-slate-700">
                    <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {user?.name ?? "MediClinic Admin"}
                    </p>

                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user?.email ?? "admin@mediclinic.pro"}
                    </p>
                  </div>

                  <ChevronsUpDown className="size-4 shrink-0 text-slate-500 dark:text-slate-400" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-60" side="right" sideOffset={10}>
                <DropdownMenuLabel className="flex min-w-0 items-center gap-3 p-2">
                  <Avatar className="size-9 border border-border">
                    <AvatarFallback className="bg-blue-600 text-xs font-semibold text-white">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>

                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {user?.name ?? "MediClinic Admin"}
                    </span>

                    <span className="block truncate text-xs text-muted-foreground">
                      {user?.email ?? "admin@mediclinic.pro"}
                    </span>
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem disabled={isLoggingOut} onSelect={handleLogout}>
                  <LogOut className="size-4" />
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </div>
      </div>
    </Sidebar>
  );
}
