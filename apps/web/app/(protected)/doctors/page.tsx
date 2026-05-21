import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { doctorController } from "@modules/doctors/controllers/doctor.controller";
import { DoctorsListView } from "@modules/doctors/views/doctors-list-view";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Doctors | MediClinic Pro",
    description: "Admin doctor management, schedules, consultation settings, and generated slots."
  };
}

export default async function DoctorsPage() {
  const session = await requirePagePermission("doctors.view");
  const data = await doctorController.listForAdmin(session.role);
  return <DoctorsListView {...data} />;
}
