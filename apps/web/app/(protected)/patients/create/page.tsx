import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { PatientForm } from "@modules/patients/views/patients-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Register Patient | MediClinic Pro"
};

export default async function CreatePatientPage() {
  await requirePagePermission("patients.create");
  return <PatientForm />;
}
