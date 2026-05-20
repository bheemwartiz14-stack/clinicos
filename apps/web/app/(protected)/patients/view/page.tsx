import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { patientService } from "@modules/patients/services/patient.service";
import { serializePatient } from "@modules/patients/utils/serialize-patient";
import { PatientsTableClient } from "./patients-table-client";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "All Patients | MediClinic Pro",
    description: "View all registered patients in a table format."
  };
}

export default async function PatientsViewPage() {
  const session = await requirePermission("patients.view");
  const rawPatients = await patientService.list(session.branchId);
  const patients = rawPatients.map((patient) => serializePatient(patient as Parameters<typeof serializePatient>[0]));

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">All Patients</h1>
        <p className="mt-2 text-sm text-slate-600">View and manage all registered patients.</p>
      </div>

      <PatientsTableClient patients={patients} />
    </section>
  );
}