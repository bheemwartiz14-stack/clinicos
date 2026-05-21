import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { patientController } from "@modules/patients/controllers/patient.controller";
import { PatientsListView } from "@modules/patients/views/patients-list-view";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Patients | MediClinic Pro",
    description: "Manage patient profiles, contact details, medical information, and appointment summaries."
  };
}

export default async function PatientsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const session = await requirePagePermission("patients.view");
  const params = await searchParams;
  const data = await patientController.listForAdmin(session.branchId, session.role, params.search);
  return <PatientsListView {...data} />;
}
