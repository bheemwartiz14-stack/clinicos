import {
  createPatientAction,
  deletePatientAction,
  patientsPageController,
  updatePatientAction,
} from "@/modules/patients";
import { PatientsView } from "@/modules/patients/views/patients.view";
import type { PatientsPageSearchParams } from "@/modules/patients";
type PatientsPageProps = {
  searchParams: Promise<PatientsPageSearchParams>;
};

export default async function PatientsPage({
  searchParams,
}: PatientsPageProps) {
  const model = await patientsPageController(searchParams);

  return (
    <PatientsView
      {...model}
      createAction={createPatientAction}
      updateAction={updatePatientAction}
      deleteAction={deletePatientAction}
    />
  );
}