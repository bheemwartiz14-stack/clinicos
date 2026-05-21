import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { AddPatientView } from "@modules/patients/views/add-patient-view";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Add Patient | MediClinic Pro",
    description: "Create a patient profile."
  };
}

export default async function AddPatientPage() {
  await requirePagePermission("patients.create");
  return <AddPatientView />;
}
