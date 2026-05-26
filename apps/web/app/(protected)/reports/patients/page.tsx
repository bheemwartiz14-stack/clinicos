import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { reportsService } from "@modules/reports/services/reports.service";
import { PatientGrowthView } from "@modules/reports/views/reports-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Patient Growth | MediClinic Pro",
};

export default async function PatientGrowthPage() {
  await requirePagePermission("reports.view");
  const data = await reportsService.patientGrowthReport();
  return <PatientGrowthView data={data} />;
}
