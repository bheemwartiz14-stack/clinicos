import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { patientService } from "@modules/patients/services/patient.service";
import { PatientProfileView } from "@modules/patients/views/patient-profile.view";

export default async function PatientTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermission("patients.timeline.view");
  const { id } = await params;
  const profile = await patientService.profile(session.branchId, id);
  if (!profile) notFound();
  return <PatientProfileView profile={profile} role={session.role} section="timeline" />;
}
