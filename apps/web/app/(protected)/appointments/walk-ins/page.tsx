import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { appointmentService } from "@modules/appointments/services/appointment.service";
import { WalkInsView } from "@modules/appointments/views/walk-ins-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Walk-ins | MediClinic Pro",
};

export default async function WalkInsPage() {
  await requirePagePermission("appointments.create");
  const currentDate = new Date().toISOString().slice(0, 10);
  const doctors = await appointmentService.getDoctors();

  return <WalkInsView doctors={doctors} currentDate={currentDate} />;
}
