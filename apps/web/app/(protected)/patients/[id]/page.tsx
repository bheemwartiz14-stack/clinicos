import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { patientService } from "@modules/patients/services/patient.service";
import { PatientDetailView } from "@modules/patients/views/patients-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Patient Profile | MediClinic Pro"
};

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("patients.view");
  const { id } = await params;
  const [patient, medicalHistory, appointmentHistory, billingHistory, notes] = await Promise.all([
    patientService.get(id),
    patientService.medicalHistory(id),
    patientService.appointmentHistory(id),
    patientService.billingHistory(id),
    patientService.notes(id)
  ]);
  if (!patient) notFound();
  return (
    <PatientDetailView
      patient={patient}
      medicalHistory={medicalHistory}
      appointmentHistory={appointmentHistory}
      billingHistory={billingHistory}
      notes={notes}
    />
  );
}
