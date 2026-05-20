import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { patientService } from "@modules/patients/services/patient.service";
import { PatientsView } from "@modules/patients/views/patients-view";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Patients | MediClinic Pro",
    description: "Manage patient profiles, medical records, documents, and billing information."
  };
}

export default async function PatientsPage() {
  await requirePagePermission("patients.view");
  const patients = await patientService.list();
  return <PatientsView patients={patients} />;
}