import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { appointmentService } from "@modules/appointments/services/appointment.service";
import { AppointmentCalendarView } from "@modules/appointments/views/appointment-calendar-view";

export const metadata: Metadata = {
  title: "Appointment Calendar | MediClinic Pro"
};

export default async function AppointmentCalendarPage() {
  const session = await requirePagePermission("appointments.calendar.view");
  const workspace = await appointmentService.calendar(session.branchId);

  return <AppointmentCalendarView appointments={workspace.appointments} />;
}
