import {
  createPatientWithPortalFromForm,
  getDoctorAssignedOptions,
  getPatientBranchOptions,
} from "@/modules/patients";
import { AddNewPatientView } from "@/modules/patients/views/add-new-patient.view";

async function createPatientAction(formData: FormData) {
  "use server";
  return createPatientWithPortalFromForm(formData);
}

export default async function AddPatientPage() {
  const [doctorOptions, branchOptions] = await Promise.all([
    getDoctorAssignedOptions(),
    getPatientBranchOptions(),
  ]);

  return (
    <AddNewPatientView
      action={createPatientAction}
      branchOptions={branchOptions}
      doctorOptions={doctorOptions}
    />
  );
}
