import { createPatientWithPortalFromForm, getDoctorAssignedOptions } from "@/modules/patients";
import { AddNewPatientView } from "@/modules/patients/views/add-new-patient.view";

async function createPatientAction(formData: FormData) {
  "use server";
  return createPatientWithPortalFromForm(formData);
}

export default async function AddPatientPage() {
  const doctorOptions = await getDoctorAssignedOptions();
  return <AddNewPatientView action={createPatientAction} doctorOptions={doctorOptions} />;
}
