import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { doctorController } from "@modules/doctors/controllers/doctor.controller";
import { AddDoctorView } from "@modules/doctors/views/add-doctor-view";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Add Doctor | MediClinic Pro",
    description: "Create a doctor account, profile, consultation settings, weekly schedule, and appointment slots."
  };
}

export default async function AddDoctorPage() {
  await requirePagePermission("doctors.create");
  const options = await doctorController.formOptions();
  return <AddDoctorView options={options} />;
}
