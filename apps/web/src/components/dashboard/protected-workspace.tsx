"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { DashboardSidebar, type SidebarUser } from "@/components/dashboard/dashboard-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export type WorkspaceSettings = {
  companyName: string | null;
  tagline: string | null;
  mainLogo: string | null;
};

const pageTitles: Record<string, string> = {
  "/ai-notes": "AI Notes",
  "/appointments": "Appointments",
  "/billing": "Billing",
  "/dashboard": "Dashboard",
  "/doctors": "Doctors",
  "/inventory": "Inventory",
  "/patients": "Patients",
  "/permissions": "Permissions",
  "/prescriptions": "Prescriptions",
  "/roles": "Roles",
  "/settings": "Settings",
};

function getWorkspaceTitle(pathname: string) {
  const match = Object.entries(pageTitles).find(([href]) => pathname.startsWith(href));

  return match?.[1] ?? "Workspace";
}

export function ProtectedWorkspace({
  children,
  settings,
  user,
}: {
  children: React.ReactNode;
  settings: WorkspaceSettings;
  user: SidebarUser;
}) {
  const pathname = usePathname();
  const title = getWorkspaceTitle(pathname);

  return (
    <SidebarProvider>
      <TooltipProvider delayDuration={0}>
        <DashboardSidebar settings={settings} user={user} />

        <SidebarInset className="overflow-hidden">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-2xl sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger>
                <Button variant="outline" size="icon" className="rounded-xl">
                  <Menu className="size-5" />
                </Button>
              </SidebarTrigger>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold">{title}</h1>
                <p className="truncate text-xs text-muted-foreground">Welcome back</p>
              </div>
            </div>

            <ThemeToggle />
          </header>

          <main className="p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  );
}
