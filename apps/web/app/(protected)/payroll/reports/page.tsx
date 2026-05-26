import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { payrollService } from "@modules/payroll/services/payroll.service";
import { PayrollReportView } from "@modules/payroll/views/payroll-report-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payroll Reports | MediClinic Pro",
};

export default async function PayrollReportPage({ searchParams }: { searchParams?: Promise<{ month?: string; year?: string }> }) {
  await requirePagePermission("payroll.view");
  const params = searchParams ? await searchParams : {};
  const now = new Date();
  const month = parseInt(params.month ?? String(now.getMonth() + 1));
  const year = parseInt(params.year ?? String(now.getFullYear()));
  const report = await payrollService.getPayoutReport(month, year);
  return <PayrollReportView report={report} month={month} year={year} />;
}
