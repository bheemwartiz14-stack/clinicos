import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { patientService } from "@modules/patients/services/patient.service";
import { PatientNotesView } from "@modules/patients/views/patients-view";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const patient = await patientService.getById(id);
  return {
    title: patient ? `Notes - ${patient.fullName ?? patient.firstName} | MediClinic Pro` : "Patient Not Found"
  };
}

export default async function PatientNotesPage({ params }: Props) {
  await requirePermission("patients.profile.view");
  const { id } = await params;
  const patient = await patientService.getById(id);
  if (!patient) notFound();
  return <PatientNotesView patientId={id} />;
}