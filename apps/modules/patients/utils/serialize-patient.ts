import type { PatientRecord } from "../types/patient.types";

export type SerializablePatientInput = Omit<PatientRecord, "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date;
};

export function serializePatient(patient: SerializablePatientInput): PatientRecord {
  return {
    ...patient,
    createdAt: patient.createdAt.toISOString(),
    updatedAt: patient.updatedAt.toISOString()
  };
}
