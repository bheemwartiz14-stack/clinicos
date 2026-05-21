import type { Metadata } from "next";
import { can } from "@mediclinic/rbac";
import { requirePagePermission } from "@/lib/auth";
import { doctorController } from "@modules/doctors/controllers/doctor.controller";
import { DoctorDetailsView } from "@modules/doctors/views/doctor-details-view";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const doctor = await doctorController.detailsForAdmin(id).catch(() => null);
  return {
    title: doctor ? `${doctor.displayName} | MediClinic Pro` : "Doctor | MediClinic Pro",
    description: "View doctor profile, fees, weekly schedule, and generated appointment slots."
  };
}

export default async function DoctorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePagePermission("doctors.view");
  const { id } = await params;
  const doctor = await doctorController.detailsForAdmin(id);
  return (
    <DoctorDetailsView
      doctor={doctor}
      canEdit={can(session.role, "doctors.edit")}
      canDelete={can(session.role, "doctors.delete")}
      canManage={can(session.role, "doctors.manage") || can(session.role, "doctors.manage-all")}
    />
  );
}
