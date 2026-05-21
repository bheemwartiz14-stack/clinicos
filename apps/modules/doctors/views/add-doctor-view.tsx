import { DoctorForm } from "../components/doctor-form";
import type { DoctorFormOptions } from "../types/doctor.types";

export function AddDoctorView({ options }: { options: DoctorFormOptions }) {
  return <DoctorForm options={options} />;
}
