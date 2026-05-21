import { PatientForm } from "../components/patient-form";
import type { PatientDetails } from "../types/patient.types";

export function EditPatientView({ patient }: { patient: PatientDetails }) {
  return <PatientForm patient={patient} />;
}
