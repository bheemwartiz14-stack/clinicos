import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { patientService } from "@modules/patients/services/patient.service";
import { PatientEditView } from "@modules/patients/views/patient-edit.view";

export default async function PatientEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermission("patients.edit");
  const { id } = await params;
  const profile = await patientService.profile(session.branchId, id);
  if (!profile) notFound();
  return <PatientEditView patient={profile.patient} />;
}
