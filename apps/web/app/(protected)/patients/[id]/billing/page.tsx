import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePagePermission } from "@/lib/auth";
import { patientService } from "@modules/patients/services/patient.service";
import { PatientBillingView } from "@modules/patients/views/patients-view";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const patient = await patientService.getById(id);
  return {
    title: patient ? `Billing - ${patient.fullName ?? patient.firstName} | MediClinic Pro` : "Patient Not Found"
  };
}

export default async function PatientBillingPage({ params }: Props) {
  await requirePagePermission("patients.billing.view");
  const { id } = await params;
  const patient = await patientService.getById(id);
  if (!patient) notFound();
  return <PatientBillingView patientId={id} />;
}