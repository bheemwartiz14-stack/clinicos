import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { appointmentService } from "@modules/appointments/services/appointment.service";
import { AppointmentQueueView } from "@modules/appointments/views/queue-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Appointment Queue | MediClinic Pro",
};

export default async function QueuePage({ searchParams }: { searchParams?: Promise<{ doctorId?: string; date?: string }> }) {
  await requirePagePermission("appointments.view");
  const params = searchParams ? await searchParams : {};
  const currentDate = params.date || new Date().toISOString().slice(0, 10);
  const doctors = await appointmentService.getDoctors();
  const selectedDoctorId = params.doctorId || doctors[0]?.id || "";
  const queue = selectedDoctorId ? await appointmentService.getQueue(selectedDoctorId, currentDate) : [];

  return <AppointmentQueueView doctors={doctors} queue={queue} currentDate={currentDate} selectedDoctorId={selectedDoctorId} />;
}
