import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { patientController } from "@modules/patients/controllers/patient.controller";
import { EditPatientView } from "@modules/patients/views/edit-patient-view";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit Patient ${id} | MediClinic Pro`,
    description: "Update patient profile."
  };
}

export default async function EditPatientPage({ params }: Props) {
  const session = await requirePagePermission("patients.edit");
  const { id } = await params;
  const patient = await patientController.detailsForAdmin(session.branchId, id);
  return <EditPatientView patient={patient} />;
}
