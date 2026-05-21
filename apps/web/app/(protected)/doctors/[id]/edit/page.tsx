import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { doctorController } from "@modules/doctors/controllers/doctor.controller";
import { EditDoctorView } from "@modules/doctors/views/edit-doctor-view";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const doctor = await doctorController.detailsForAdmin(id).catch(() => null);
  return {
    title: doctor ? `Edit ${doctor.displayName} | MediClinic Pro` : "Edit Doctor | MediClinic Pro",
    description: "Update doctor profile, consultation settings, availability, and weekly schedule."
  };
}

export default async function EditDoctorPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("doctors.edit");
  const { id } = await params;
  const [doctor, options] = await Promise.all([
    doctorController.detailsForAdmin(id),
    doctorController.formOptions()
  ]);
  return <EditDoctorView doctor={doctor} options={options} />;
}
