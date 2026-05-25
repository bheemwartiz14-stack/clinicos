import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { specialtyService } from "@modules/specialties/services/specialty.service";
import { SpecialtyForm } from "@modules/specialties/views/specialties-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add Doctor Specialty | MediClinic Pro",
};

export default async function CreateDoctorSpecialtyPage() {
  await requirePagePermission("specialties.manage");
  const departments = await specialtyService.listDepartments();

  return <SpecialtyForm departments={departments} />;
}
