import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { ReportsOverview } from "@modules/reports/views/reports-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reports | MediClinic Pro",
};

export default async function ReportsPage() {
  await requirePagePermission("reports.view");
  return <ReportsOverview />;
}
