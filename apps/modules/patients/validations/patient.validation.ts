import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().nullable().transform((value) => (value === "" ? null : value));

const usState = z.string().trim().length(2, "Use the 2-letter state code").toUpperCase().optional().nullable().or(z.literal(""));
const usZip = z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Use a valid ZIP code").optional().nullable().or(z.literal(""));
const usPhone = z.string().trim().regex(/^(\+1\s?)?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}$/, "Use a valid US phone number");
const dateNotFuture = z.string().date().refine((value) => new Date(value) <= new Date(), "Date cannot be in the future");
const optionalDate = z.string().date().optional().nullable().or(z.literal(""));
const documentMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;

export const patientCreateSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(120),
  lastName: z.string().trim().min(1, "Last name is required").max(120),
  dateOfBirth: dateNotFuture,
  sex: z.string().trim().min(1, "Sex is required").max(32),
  bloodGroup: optionalText(16),
  maritalStatus: optionalText(32),
  occupation: optionalText(120),
  preferredLanguage: z.string().trim().max(80).default("English"),
  phone: usPhone,
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  addressLine1: optionalText(255),
  addressLine2: optionalText(255),
  city: optionalText(120),
  state: usState,
  postalCode: usZip,
  emergencyContactName: optionalText(120),
  emergencyContactPhone: z.string().trim().optional().nullable().or(z.literal("")),
  emergencyContactRelationship: optionalText(80),
  allergies: z.string().trim().max(4000).default(""),
  medications: z.string().trim().max(4000).default(""),
  insurancePayer: optionalText(160),
  insuranceMemberId: optionalText(120),
  insuranceGroupId: optionalText(120),
  consentOnFile: z.coerce.boolean().default(false),
  portalAccess: z.coerce.boolean().default(false),
  portalPassword: optionalText(128)
}).superRefine((value, ctx) => {
  if (!value.emergencyContactName || !value.emergencyContactPhone || !value.emergencyContactRelationship) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Emergency contact name, phone, and relationship are required", path: ["emergencyContactName"] });
  }
  if (value.portalAccess && !value.email) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Email is required for portal access", path: ["email"] });
  }
  if (value.portalAccess && (!value.portalPassword || value.portalPassword.length < 8)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Portal password must be at least 8 characters", path: ["portalPassword"] });
  }
});

export type PatientCreateInput = z.infer<typeof patientCreateSchema>;

export const patientUpdateSchema = z.object({
  patientId: z.string().uuid(),
  firstName: z.string().trim().min(1).max(120).optional(),
  lastName: z.string().trim().min(1).max(120).optional(),
  dateOfBirth: dateNotFuture.optional(),
  sex: z.string().trim().min(1).max(32).optional(),
  bloodGroup: optionalText(16),
  maritalStatus: optionalText(32),
  occupation: optionalText(120),
  preferredLanguage: z.string().trim().max(80).optional(),
  phone: usPhone.optional(),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  isActive: z.coerce.boolean().optional()
});

export const patientSearchSchema = z.object({
  query: z.string().trim().max(200).default(""),
  status: z.enum(["active", "inactive", "all"]).default("active"),
  sort: z.enum(["name", "created", "mrn"]).default("name")
});

export const patientAddressSchema = z.object({
  patientId: z.string().uuid(),
  addressType: z.enum(["home", "work", "billing", "other"]).default("home"),
  line1: z.string().trim().min(1).max(255),
  line2: optionalText(255),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().length(2).toUpperCase(),
  postalCode: usZip,
  country: z.string().trim().max(120).default("USA"),
  isPrimary: z.coerce.boolean().default(true)
});

export const patientEmergencyContactSchema = z.object({
  patientId: z.string().uuid(),
  name: z.string().trim().min(1).max(160),
  relationship: z.string().trim().min(1).max(80),
  phone: usPhone,
  email: z.string().trim().email().optional().or(z.literal("")),
  address: optionalText(500),
  isPrimary: z.coerce.boolean().default(false)
});

export const patientInsuranceSchema = z.object({
  patientId: z.string().uuid(),
  payerName: z.string().trim().min(1).max(160),
  policyNumber: optionalText(120),
  memberId: z.string().trim().min(1).max(120),
  groupNumber: optionalText(120),
  policyHolderName: optionalText(160),
  relationshipToPatient: optionalText(80),
  validFrom: optionalDate,
  validTo: optionalDate,
  coverageNotes: optionalText(1000),
  isActive: z.coerce.boolean().default(true)
}).refine((value) => !value.validFrom || !value.validTo || new Date(value.validTo) >= new Date(value.validFrom), {
  path: ["validTo"],
  message: "Insurance end date must be after start date"
});

export const patientAllergySchema = z.object({
  patientId: z.string().uuid(),
  allergen: z.string().trim().min(1).max(160),
  allergyType: z.enum(["drug", "food", "environment", "latex", "other"]).default("other"),
  severity: z.enum(["mild", "moderate", "severe", "unknown"]).default("unknown"),
  reaction: optionalText(255),
  notes: optionalText(1000)
});

export const patientFamilyMemberSchema = z.object({
  patientId: z.string().uuid(),
  relatedPatientId: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(1).max(160),
  relationship: z.string().trim().min(1).max(80),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  dateOfBirth: optionalDate,
  isDependent: z.coerce.boolean().default(false),
  notes: optionalText(1000)
});

export const patientMedicalHistorySchema = z.object({
  patientId: z.string().uuid(),
  conditionName: z.string().trim().min(1).max(180),
  diagnosisDate: optionalDate,
  status: z.enum(["active", "resolved", "chronic", "inactive"]).default("active"),
  severity: z.enum(["mild", "moderate", "severe", "unknown"]).default("unknown"),
  notes: optionalText(4000)
});

export const patientNoteSchema = z.object({
  patientId: z.string().uuid(),
  noteType: z.enum(["general", "doctor", "nursing", "admin", "billing"]).default("general"),
  title: optionalText(160),
  body: z.string().trim().min(1).max(12000),
  visibility: z.enum(["care_team", "doctor_only", "billing", "admin"]).default("care_team"),
  soap: z.object({
    subjective: z.string().max(4000).optional(),
    objective: z.string().max(4000).optional(),
    assessment: z.string().max(4000).optional(),
    plan: z.string().max(4000).optional()
  }).optional(),
  icd10Codes: z.array(z.string().trim().max(16)).default([]),
  cptCodes: z.array(z.string().trim().max(16)).default([])
});

export type PatientNoteInput = z.infer<typeof patientNoteSchema>;
export type PatientUpdateInput = z.infer<typeof patientUpdateSchema>;
export type PatientSearchInput = z.infer<typeof patientSearchSchema>;
export type PatientAddressInput = z.infer<typeof patientAddressSchema>;
export type PatientEmergencyContactInput = z.infer<typeof patientEmergencyContactSchema>;
export type PatientInsuranceInput = z.infer<typeof patientInsuranceSchema>;
export type PatientAllergyInput = z.infer<typeof patientAllergySchema>;
export type PatientFamilyMemberInput = z.infer<typeof patientFamilyMemberSchema>;
export type PatientMedicalHistoryInput = z.infer<typeof patientMedicalHistorySchema>;

export const patientDocumentUploadSchema = z.object({
  patientId: z.string().uuid(),
  documentType: z.enum(["report", "prescription", "scan", "pdf", "image", "insurance", "other"]),
  title: z.string().trim().min(1).max(180),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.enum(documentMimeTypes),
  byteSize: z.coerce.number().int().positive().max(10 * 1024 * 1024, "Maximum file size is 10 MB"),
  storageKey: z.string().trim().min(1).max(500),
  description: optionalText(1000),
  isSensitive: z.coerce.boolean().default(false)
});

export const patientAISummaryRequestSchema = z.object({
  patientId: z.string().uuid(),
  summaryType: z.enum(["basic", "clinical", "billing", "followup"]).default("clinical")
});

export const patientFollowupSuggestionSchema = z.object({
  patientId: z.string().uuid(),
  recommendedDate: optionalDate,
  department: optionalText(120),
  recommendedDoctorId: z.string().uuid().optional().nullable(),
  reason: z.string().trim().min(1).max(4000),
  priority: z.enum(["routine", "priority", "urgent"]).default("routine")
});

export type PatientDocumentUploadInput = z.infer<typeof patientDocumentUploadSchema>;
export type PatientAISummaryRequestInput = z.infer<typeof patientAISummaryRequestSchema>;
export type PatientFollowupSuggestionInput = z.infer<typeof patientFollowupSuggestionSchema>;

export const patientCreateFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(120),
  lastName: z.string().trim().min(1, "Last name is required").max(120),
  dateOfBirth: z.string().min(1, "Date of birth is required").refine((value) => new Date(value) <= new Date(), "Date of birth cannot be in the future"),
  sex: z.string().trim().min(1, "Sex is required"),
  phone: z.string().trim().min(1, "Phone number is required").regex(/^(\+1\s?)?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}$/, "Enter a valid US phone number"),
  email: z.string().trim().email("Enter a valid email").or(z.literal("")),
  addressLine1: z.string().trim().max(255).or(z.literal("")),
  addressLine2: z.string().trim().max(255).or(z.literal("")),
  city: z.string().trim().max(120).or(z.literal("")),
  state: z.string().trim().max(2).or(z.literal("")),
  postalCode: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code").or(z.literal("")),
  emergencyContactName: z.string().trim().min(1, "Emergency contact name is required").max(120),
  emergencyContactPhone: z.string().trim().min(1, "Emergency contact phone is required").regex(/^(\+1\s?)?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}$/, "Enter a valid US phone number"),
  emergencyContactRelationship: z.string().trim().min(1, "Relationship is required").max(80),
  allergies: z.string().trim().max(4000).default(""),
  medications: z.string().trim().max(4000).default(""),
  insurancePayer: z.string().trim().max(160).or(z.literal("")),
  insuranceMemberId: z.string().trim().max(120).or(z.literal("")),
  insuranceGroupId: z.string().trim().max(120).or(z.literal("")),
  consentOnFile: z.boolean().default(false),
  portalAccess: z.boolean().default(false),
  portalPassword: z.string().min(8, "Password must be at least 8 characters").or(z.literal(""))
}).superRefine((value, ctx) => {
  if (value.portalAccess && !value.email) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Email is required for portal access", path: ["email"] });
  }
});

export type PatientCreateFormData = z.infer<typeof patientCreateFormSchema>;

export const patientEditFormSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  firstName: z.string().trim().min(1, "First name is required").max(120),
  lastName: z.string().trim().min(1, "Last name is required").max(120),
  dateOfBirth: z.string().min(1, "Date of birth is required").refine((value) => new Date(value) <= new Date(), "Date of birth cannot be in the future"),
  sex: z.string().trim().min(1, "Sex is required"),
  phone: z.string().trim().min(1, "Phone number is required").regex(/^(\+1\s?)?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}$/, "Enter a valid US phone number"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  bloodGroup: z.string().trim().max(16).optional().or(z.literal("")),
  maritalStatus: z.string().trim().max(32).optional().or(z.literal("")),
  occupation: z.string().trim().max(120).optional().or(z.literal("")),
  preferredLanguage: z.string().trim().max(80).optional().or(z.literal("")),
  isActive: z.boolean().default(true)
});

export type PatientEditFormData = z.infer<typeof patientEditFormSchema>;
