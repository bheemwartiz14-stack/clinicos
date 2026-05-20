import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { can } from "@mediclinic/rbac";
import { getSession } from "@/lib/auth";
import { DashboardView } from "@modules/dashboard/views/dashboard-view";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Command Center | MediClinic Pro",
    description:
      "Secure clinic operations dashboard for appointments, queue management, billing, payroll, and AI-assisted workflows.",
  };
}

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!can(session.role, "dashboard.view")) redirect("/403" as any);

  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardView />
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
