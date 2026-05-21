import { Suspense } from "react";
import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { dashboardService } from "@modules/dashboard/services/dashboard.service";
import { DashboardView } from "@modules/dashboard/views/dashboard-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Command Center | MediClinic Pro",
    description:
      "Secure clinic operations dashboard for appointments, queue management, billing, payroll, and AI-assisted workflows.",
  };
}

export default async function HomePage() {
  const session = await requirePagePermission("dashboard.view");
  const dashboardData = await dashboardService.getDashboardData(session.branchId);

  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardView data={dashboardData} />
    </Suspense>
  );
}

function DashboardFallback() {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 rounded-lg bg-muted" />
        ))}
      </div>

      <div className="mt-5 h-96 rounded-lg bg-muted" />
    </div>
  );
}
