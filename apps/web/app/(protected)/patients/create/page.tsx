import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { PatientCreateForm } from "@modules/patients/views/patient-create.view";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Create Patient | MediClinic Pro" };
}

export default async function CreatePatientPage() {
  await requirePermission("patients.create");
  return <PatientCreateForm />;
}
