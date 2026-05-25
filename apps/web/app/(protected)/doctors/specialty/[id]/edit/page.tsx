import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePagePermission } from "@/lib/auth";
import { specialtyService } from "@modules/specialties/services/specialty.service";
import { SpecialtyForm } from "@modules/specialties/views/specialties-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Doctor Specialty | MediClinic Pro",
};

export default async function EditDoctorSpecialtyPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("specialties.manage");
  const { id } = await params;
  const [specialty, departments] = await Promise.all([
    specialtyService.get(id),
    specialtyService.listDepartments(),
  ]);

  if (!specialty) notFound();

  return <SpecialtyForm specialty={specialty} departments={departments} />;
}
