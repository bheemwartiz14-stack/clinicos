import type { PatientCreateInput } from "@mediclinicpro/validations";

export type PatientListItem = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string | null;
  address: string | null;
  allergies: string | null;
  medicalHistory: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PatientStats = {
  totalPatients: number;
  newThisWeek: number;
  recentlyUpdated: number;
};

export type PatientsPageSearchParams = {
  q?: string;
  created?: string;
  updated?: string;
  deleted?: string;
};

export type PatientsPageModel = {
  title: string;
  description: string;
  breadcrumb: string[];
  patients: PatientListItem[];
  stats: PatientStats;
  query: string;
  created: boolean;
};

export type ActionState = {
  ok: boolean;
  message: string;
};

export type CreatePatientInput = PatientCreateInput;
export type UpdatePatientInput = Partial<PatientCreateInput>;
