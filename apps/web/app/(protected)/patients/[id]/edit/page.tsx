import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { patientService } from "@modules/patients/services/patient.service";
import { PatientForm } from "@modules/patients/views/patients-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Patient | MediClinic Pro"
};

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("patients.edit");
  const { id } = await params;
  const patient = await patientService.get(id);
  if (!patient) notFound();
  return <PatientForm patient={patient} />;
}
