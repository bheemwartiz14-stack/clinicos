import { DoctorForm } from "../components/doctor-form";
import type { DoctorDetails, DoctorFormOptions } from "../types/doctor.types";

export function EditDoctorView({ doctor, options }: { doctor: DoctorDetails; options: DoctorFormOptions }) {
  return <DoctorForm doctor={doctor} options={options} />;
}
