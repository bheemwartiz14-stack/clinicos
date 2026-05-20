export type PatientRecord = {
  id: string;
  userId: string | null;
  branchId: string;
  branchName: string | null;
  mrn: string;
  firstName: string;
  lastName: string;
  fullName: string | null;
  dateOfBirth: Date | string;
  sex: string;
  gender: string | null;
  phone: string;
  email: string | null;
  bloodGroup: string | null;
  maritalStatus: string | null;
  occupation: string | null;
  preferredLanguage: string;
  profilePhotoUrl: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type PatientWithDetails = PatientRecord & {
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
  } | null;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  } | null;
  allergies: string;
  medications: string;
  insurance: {
    payer: string;
    memberId: string;
    groupId?: string;
  } | null;
};

export type PatientFilterInput = {
  branchId?: string;
  search?: string;
  isActive?: boolean;
};

export type PatientNote = {
  id: string;
  patientId: string;
  noteType: string;
  content: string;
  createdByUserId: string;
  createdByName: string | null;
  createdAt: string;
};

export type PatientDocument = {
  id: string;
  patientId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  uploadedByUserId: string;
  uploadedByName: string | null;
  createdAt: string;
};

export type PatientTimelineEvent = {
  id: string;
  patientId: string;
  eventType: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  createdByUserId: string;
  createdByName: string | null;
  createdAt: string;
};