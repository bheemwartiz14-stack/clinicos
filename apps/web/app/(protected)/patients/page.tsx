import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { patientService } from "@modules/patients/services/patient.service";
import { PatientsListView } from "@modules/patients/views/patients-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Patients | MediClinic Pro"
};

export default async function PatientsPage({ searchParams }: { searchParams?: Promise<{ q?: string; status?: string }> }) {
  await requirePagePermission("patients.view");
  const params = searchParams ? await searchParams : {};
  const patients = await patientService.search({ q: params.q });
  return <PatientsListView patients={patients} q={params.q} status={params.status} />;
}
