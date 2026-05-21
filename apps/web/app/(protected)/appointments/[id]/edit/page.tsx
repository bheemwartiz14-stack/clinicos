import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { can, canAny } from "@mediclinic/rbac";
import { requirePagePermission } from "@/lib/auth";
import { appointmentService } from "@modules/appointments/services/appointment.service";
import { AppointmentDetailView } from "@modules/appointments/views/appointment-detail-view";
import { AppointmentsView } from "@modules/appointments/views/appointments-view";

export const metadata: Metadata = {
  title: "Edit Appointment | MediClinic Pro"
};

export default async function AppointmentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePagePermission("appointments.edit");
  const { id } = await params;
  const [detail, workspace] = await Promise.all([
    appointmentService.detail(session.branchId, id),
    appointmentService.workspace(session.branchId)
  ]);
  if (!detail) notFound();

  return (
    <div className="grid gap-6">
      <AppointmentDetailView detail={detail as any} />
      <AppointmentsView
        appointments={workspace.appointments}
        queue={workspace.queue}
        patients={workspace.patients}
        doctors={workspace.doctors}
        canManage={can(session.role, "appointments.manage") || canAny(session.role, ["appointments.edit", "appointments.reschedule", "appointments.cancel"])}
      />
    </div>
  );
}
