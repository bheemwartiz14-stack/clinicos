import type { PatientCreateInput } from "@mediclinicpro/validations";

export type PatientListItem = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  dateOfBirth: string;
  age: number | null;
  gender: string;
  bloodGroup: string | null;
  doctorAssigned: string | null;
  admissionDate: string | null;
  dischargeDate: string | null;
  status: string;
  address: string | null;
  allergies: string | null;
  medicalHistory: string | null;
  insuranceProvider: string | null;
  insurancePolicyNumber: string | null;
  insuranceMemberId: string | null;
  insuranceGroupNumber: string | null;
  portalLoginEnabled: boolean;
  portalLastLoginAt: Date | null;
  familyMembers: PatientFamilyMember[];
  visits: PatientVisit[];
  documents: PatientDocument[];
  feedback: PatientFeedback[];
  createdAt: Date;
  updatedAt: Date;
};

export type PatientFamilyMember = {
  id: string;
  fullName: string;
  relationship: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
};

export type PatientVisit = {
  id: string;
  visitDate: Date;
  visitType: string;
  doctorName: string | null;
  chiefComplaint: string | null;
  diagnosis: string | null;
  treatmentPlan: string | null;
  notes: string | null;
};

export type PatientDocument = {
  id: string;
  title: string;
  documentType: string;
  fileUrl: string;
  fileName: string | null;
  uploadedBy: string | null;
  createdAt: Date;
};

export type PatientFeedback = {
  id: string;
  rating: number;
  comment: string | null;
  source: string;
  createdAt: Date;
};

export type DoctorOption = {
  id: string;
  label: string;
  name: string;
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
