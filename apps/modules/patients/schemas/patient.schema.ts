import { z } from "zod";

export const patientGenderOptions = ["male", "female", "transgender", "non_binary", "prefer_not_to_say", "other"] as const;
export const patientBloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"] as const;
export const patientMaritalStatusOptions = ["single", "married", "divorced", "widowed", "separated"] as const;

const optionalText = (max: number) => z.string().trim().max(max).optional().nullable().transform((value) => value || null);

export const patientFormSchema = z.object({
  patientCode: optionalText(32),
  fullName: z.string().trim().min(2, "Full name is required").max(260),
  email: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")).transform((value) => value || null),
  phone: z.string().trim().min(5, "Phone is required").max(32),
  dateOfBirth: z.string().date("Date of birth is required").refine((value) => new Date(value) <= new Date(), "Date of birth cannot be in the future"),
  gender: z.enum(patientGenderOptions).nullable().optional().or(z.literal("")).transform((value) => value || null),
  bloodGroup: z.enum(patientBloodGroupOptions).default("unknown"),
  maritalStatus: z.enum(patientMaritalStatusOptions).nullable().optional().or(z.literal("")).transform((value) => value || null),
  address: optionalText(2000),
  emergencyContactName: optionalText(160),
  emergencyContactPhone: optionalText(32),
  allergies: z.string().trim().max(4000).default(""),
  chronicDiseases: z.string().trim().max(4000).default(""),
  currentMedications: z.string().trim().max(4000).default(""),
  notes: z.string().trim().max(4000).default(""),
  isActive: z.coerce.boolean().default(true)
});

export const patientUpdateSchema = patientFormSchema.extend({
  id: z.string().uuid()
});

export const patientFilterSchema = z.object({
  search: z.string().trim().optional().default("")
});

export type PatientFormInput = z.infer<typeof patientFormSchema>;
export type PatientUpdateInput = z.infer<typeof patientUpdateSchema>;
export type PatientFilterInput = z.infer<typeof patientFilterSchema>;
export type PatientGender = (typeof patientGenderOptions)[number];
export type PatientBloodGroup = (typeof patientBloodGroupOptions)[number];
export type PatientMaritalStatus = (typeof patientMaritalStatusOptions)[number];
