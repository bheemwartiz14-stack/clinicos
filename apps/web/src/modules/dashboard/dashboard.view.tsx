import { Suspense } from "react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatCards } from "@/components/dashboard/stat-cards";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PatientTable } from "@/components/patients/patient-table";
import type { DashboardPageModel } from "./dashboard.types";

export function DashboardView({ title, breadcrumb }: DashboardPageModel) {
  return (
    <DashboardShell title={title} breadcrumb={breadcrumb}>
      <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-slate-100" />}>
        <StatCards />
      </Suspense>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <RevenueChart />
        <ActivityFeed />
      </div>
      <PatientTable />
    </DashboardShell>
  );
}
