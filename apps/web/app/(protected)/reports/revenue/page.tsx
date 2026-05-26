import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { reportsService } from "@modules/reports/services/reports.service";
import { RevenueReportView } from "@modules/reports/views/reports-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Revenue Report | MediClinic Pro",
};

export default async function RevenueReportPage({ searchParams }: { searchParams?: Promise<{ from?: string; to?: string }> }) {
  await requirePagePermission("reports.view");
  const params = searchParams ? await searchParams : {};
  const now = new Date();
  const fromDate = params.from || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const toDate = params.to || now.toISOString().slice(0, 10);
  const report = await reportsService.revenueReport(fromDate, toDate);
  return <RevenueReportView report={report} />;
}
