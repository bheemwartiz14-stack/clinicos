import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { appointmentService } from "@modules/appointments/services/appointment.service";
import { AppointmentDetailView } from "@modules/appointments/views/appointment-detail-view";

export const metadata: Metadata = {
  title: "Appointment Detail | MediClinic Pro"
};

export default async function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePagePermission("appointments.view");
  const { id } = await params;
  const detail = await appointmentService.detail(session.branchId, id);
  if (!detail) notFound();

  return <AppointmentDetailView detail={detail as any} />;
}
