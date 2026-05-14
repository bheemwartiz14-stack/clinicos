import { z } from "zod";

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export const patientCreateSchema = z.object({
  branchId: z.string().uuid().optional(),
  username: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(7),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  age: z.preprocess(
    (value) => (value === "" || value === undefined || value === null ? undefined : value),
    z.coerce.number().int().min(0).max(130).optional(),
  ),
  gender: z.enum(["female", "male", "other", "unknown"]).default("unknown"),
  bloodGroup: z.string().max(8).optional(),
  doctorAssigned: z.string().max(160).optional(),
  admissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  dischargeDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional(),
  status: z.enum(["active", "admitted", "discharged", "transferred"]).default("active"),
  address: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  insuranceProvider: z.string().max(160).optional(),
  insurancePolicyNumber: z.string().max(120).optional(),
  insuranceMemberId: z.string().max(120).optional(),
  insuranceGroupNumber: z.string().max(120).optional(),
  portalLoginEnabled: z.coerce.boolean().default(false),
});

export const patientUpdateSchema = patientCreateSchema.partial().extend({
  id: z.string().uuid(),
  version: z.number().int().nonnegative(),
});

export const userProfileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(255),
});

export const appointmentCreateSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  reason: z.string().min(2),
  notes: z.string().optional(),
});

export const invoiceCreateSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  lineItems: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().positive(),
        unitPrice: z.number().nonnegative(),
        taxRate: z.number().min(0).max(100).default(0),
      }),
    )
    .min(1),
});

export const prescriptionCreateSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  diagnosis: z.string().min(2),
  medicines: z
    .array(
      z.object({
        name: z.string().min(1),
        dosage: z.string().min(1),
        duration: z.string().min(1),
        instructions: z.string().optional(),
      }),
    )
    .min(1),
  notes: z.string().optional(),
});

export const offlineMutationSchema = z.object({
  id: z.string(),
  entity: z.enum(["patient", "appointment", "invoice", "prescription"]),
  operation: z.enum(["create", "update", "delete"]),
  payload: z.unknown(),
  baseVersion: z.number().int().optional(),
  createdAt: z.string(),
});

export type PatientCreateInput = z.infer<typeof patientCreateSchema>;
export type PatientUpdateInput = z.infer<typeof patientUpdateSchema>;
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;
