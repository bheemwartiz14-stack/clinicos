import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { payrollService } from "@modules/payroll/services/payroll.service";
import { doctorService } from "@modules/doctors/services/doctor.service";
import { DoctorsPayoutView } from "@modules/payroll/views/doctors-payout-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Doctor Payout Settings | MediClinic Pro",
};

export default async function DoctorPayoutsPage() {
  await requirePagePermission("payroll.view");
  const [settings, doctors] = await Promise.all([
    payrollService.listDoctorPayoutSettings(),
    doctorService.list(),
  ]);
  return <DoctorsPayoutView settings={settings} doctors={doctors.map((d) => ({ id: d.id, name: d.name }))} />;
}
