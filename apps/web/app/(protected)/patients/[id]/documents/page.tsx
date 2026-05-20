import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePagePermission } from "@/lib/auth";
import { patientService } from "@modules/patients/services/patient.service";
import { PatientDocumentsView } from "@modules/patients/views/patients-view";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const patient = await patientService.getById(id);
  return {
    title: patient ? `Documents - ${patient.fullName ?? patient.firstName} | MediClinic Pro` : "Patient Not Found"
  };
}

export default async function PatientDocumentsPage({ params }: Props) {
  await requirePagePermission("patients.profile.view");
  const { id } = await params;
  const patient = await patientService.getById(id);
  if (!patient) notFound();
  return <PatientDocumentsView patientId={id} />;
}