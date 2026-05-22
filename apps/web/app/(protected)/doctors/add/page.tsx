import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { doctorService } from "@modules/doctors/services/doctor.service";
import { DoctorForm } from "@modules/doctors/views/doctors-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add Doctor | MediClinic Pro"
};

export default async function AddDoctorPage() {
  await requirePagePermission("doctors.manage");
  const [departments, specialties] = await Promise.all([doctorService.listDepartments(), doctorService.listSpecialties()]);
  return <DoctorForm departments={departments} specialties={specialties} />;
}
