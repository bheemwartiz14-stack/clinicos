import type { Metadata } from "next";
import { can, canAny } from "@mediclinic/rbac";
import { requirePagePermission } from "@/lib/auth";
import { appointmentService } from "@modules/appointments/services/appointment.service";
import { AppointmentsView } from "@modules/appointments/views/appointments-view";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Appointment Management | MediClinic Pro",
    description: "Book appointments, manage schedules, run queue tokens, reschedule visits, and coordinate Google Calendar or Meet workflows."
  };
}

export default async function AppointmentsPage() {
  const session = await requirePagePermission("appointments.view");
  const workspace = await appointmentService.workspace(session.branchId);

  return (
    <AppointmentsView
      appointments={workspace.appointments}
      queue={workspace.queue}
      patients={workspace.patients}
      doctors={workspace.doctors}
      canManage={can(session.role, "appointments.manage") || canAny(session.role, ["appointments.create", "appointments.edit", "appointments.checkin", "appointments.complete"])}
    />
  );
}
