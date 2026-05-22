import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { doctorService } from "@modules/doctors/services/doctor.service";
import { DoctorForm } from "@modules/doctors/views/doctors-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Doctor | MediClinic Pro"
};

export default async function EditDoctorPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("doctors.manage");
  const { id } = await params;
  const [doctor, departments, specialties] = await Promise.all([doctorService.get(id), doctorService.listDepartments(), doctorService.listSpecialties()]);
  if (!doctor) notFound();
  return <DoctorForm doctor={doctor} departments={departments} specialties={specialties} />;
}
