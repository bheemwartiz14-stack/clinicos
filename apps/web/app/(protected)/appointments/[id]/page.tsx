import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { appointmentService } from "@modules/appointments/services/appointment.service";
import { AppointmentDetailView } from "@modules/appointments/views/appointment-detail-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Appointment Detail | MediClinic Pro"
};

export default async function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("appointments.view");
  const { id } = await params;
  const appointment = await appointmentService.get(id);
  if (!appointment) notFound();
  return <AppointmentDetailView appointment={appointment} />;
}
