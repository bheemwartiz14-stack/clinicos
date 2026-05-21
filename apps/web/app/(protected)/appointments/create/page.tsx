import type { Metadata } from "next";
import { can, canAny } from "@mediclinic/rbac";
import { requirePagePermission } from "@/lib/auth";
import { appointmentService } from "@modules/appointments/services/appointment.service";
import { AppointmentsView } from "@modules/appointments/views/appointments-view";

export const metadata: Metadata = {
  title: "Create Appointment | MediClinic Pro"
};

export default async function CreateAppointmentPage() {
  const session = await requirePagePermission("appointments.create");
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
