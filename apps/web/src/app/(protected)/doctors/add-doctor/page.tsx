import { addDoctorPageController, createDoctorAction } from "@/modules/doctors";
import { AddDoctorView } from "@/modules/doctors/views/add-doctor.view";

export default async function AddDoctorPage() {
  const model = await addDoctorPageController();

  return <AddDoctorView {...model} action={createDoctorAction} />;
}
