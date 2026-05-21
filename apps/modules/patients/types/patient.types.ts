import type { PatientBloodGroup, PatientGender, PatientMaritalStatus } from "../schemas/patient.schema";

export type PatientRecord = {
  id: string;
  userId: string | null;
  branchId: string;
  branchName: string | null;
  mrn: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string;
  dateOfBirth: string;
  gender: PatientGender | null;
  bloodGroup: PatientBloodGroup;
  maritalStatus: PatientMaritalStatus | null;
  address: { line1: string; line2?: string; city: string; state: string; postalCode: string } | string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  allergies: string;
  chronicDiseases: string;
  currentMedications: string;
  notes: string;
  isActive: boolean;
  appointmentCount: number;
  upcomingAppointmentCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PatientDetails = PatientRecord & {
  lastAppointmentAt: Date | null;
};

export type PatientFormDefaults = Partial<PatientRecord>;

export type PatientSearchFilter = {
  search?: string;
};

export type PatientWithDetails = PatientDetails;
export type PatientFilterInput = PatientSearchFilter & {
  branchId?: string;
  isActive?: boolean;
};
