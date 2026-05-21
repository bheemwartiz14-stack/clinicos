import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { appointmentService } from "@modules/appointments/services/appointment.service";
import { AppointmentQueueView } from "@modules/appointments/views/appointment-queue-view";

export const metadata: Metadata = {
  title: "Appointment Queue | MediClinic Pro"
};

export default async function AppointmentQueuePage() {
  const session = await requirePagePermission("appointments.queue.manage");
  const queue = await appointmentService.queue(session.branchId);

  return <AppointmentQueueView queue={queue} />;
}
