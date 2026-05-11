import { DashboardShell } from "@/components/layout/dashboard-shell";

import { StatCards } from "./components/stat-cards";

import type { DashboardPageModel } from "./dashboard.types";
import { RevenueChart } from "./components/revenue-chart";
import { ActivityFeed } from "./components/activity-feed";

export function DashboardView({
  title,
  description,
  breadcrumb,
  stats,
}: DashboardPageModel) {
  return (
    <DashboardShell
      title={title}
      breadcrumb={breadcrumb}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <StatCards stats={stats} />
      </div>
       <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <RevenueChart />
        <ActivityFeed />
      </div>
    </DashboardShell>
  );
}