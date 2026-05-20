import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { patientService } from "@modules/patients/services/patient.service";
import { serializePatient } from "@modules/patients/utils/serialize-patient";
import { PatientsView } from "@modules/patients/views/patients-view";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Patient Management | MediClinic Pro",
    description: "Register patients, search charts, manage history, insurance, documents, billing, and portal access."
  };
}

export default async function PatientsPage() {
  const session = await requirePermission("patients.view");
  const rawPatients = await patientService.list(session.branchId);
  const patients = rawPatients.map((patient) => serializePatient(patient as Parameters<typeof serializePatient>[0]));

  return <PatientsView patients={patients} />;
}
