import type { Metadata } from "next";
import { can } from "@mediclinic/rbac";
import { requirePagePermission } from "@/lib/auth";
import { patientController } from "@modules/patients/controllers/patient.controller";
import { PatientDetailsView } from "@modules/patients/views/patient-details-view";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Patient ${id} | MediClinic Pro`,
    description: "View patient profile and appointment summary."
  };
}

export default async function PatientDetailsPage({ params }: Props) {
  const session = await requirePagePermission("patients.view");
  const { id } = await params;
  const patient = await patientController.detailsForAdmin(session.branchId, id);
  return (
    <PatientDetailsView
      patient={patient}
      canEdit={can(session.role, "patients.edit")}
      canDelete={can(session.role, "patients.delete")}
      canManage={can(session.role, "patients.manage")}
    />
  );
}
