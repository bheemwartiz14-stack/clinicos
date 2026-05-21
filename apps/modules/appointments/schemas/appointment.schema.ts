import { z } from "zod";
import { patientBloodGroupOptions, patientGenderOptions, patientMaritalStatusOptions } from "../../patients/schemas/patient.schema";

export const appointmentStatuses = ["confirmed", "checked_in", "completed", "cancelled", "no_show"] as const;
export const appointmentTypes = ["in_clinic", "online", "follow_up", "emergency"] as const;

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm time format");
const nullableText = (max: number) => z.string().trim().max(max).optional().nullable().transform((value) => value || null);

export const appointmentFormSchema = z.object({
  patientId: z.string().uuid("Select a patient"),
  doctorId: z.string().uuid("Select a doctor"),
  appointmentDate: z.string().date("Select a valid date"),
  startTime: timeSchema,
  durationMinutes: z.coerce.number().int().min(5).max(240),
  type: z.enum(appointmentTypes),
  reasonForVisit: z.string().trim().min(1, "Reason for visit is required").max(255),
  notes: nullableText(4000),
  status: z.enum(appointmentStatuses).default("confirmed")
});

export const appointmentUpdateSchema = appointmentFormSchema.extend({
  id: z.string().uuid()
});

export const appointmentStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(appointmentStatuses)
});

export const appointmentRescheduleSchema = z.object({
  id: z.string().uuid(),
  appointmentDate: z.string().date(),
  startTime: timeSchema,
  durationMinutes: z.coerce.number().int().min(5).max(240)
});

export const appointmentCancelSchema = z.object({
  id: z.string().uuid(),
  cancelledReason: z.string().trim().min(2, "Cancellation reason is required").max(500)
});

export const quickPatientCreateSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(260),
  email: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")).transform((value) => value || null),
  dateOfBirth: z.string().date("Date of birth is required"),
  gender: z.enum(patientGenderOptions).default("other"),
  bloodGroup: z.enum(patientBloodGroupOptions).default("unknown"),
  maritalStatus: z.enum(patientMaritalStatusOptions).default("single"),
  phone: z.string().trim().min(5, "Phone is required").max(32)
});

export type AppointmentFormInput = z.infer<typeof appointmentFormSchema>;
export type AppointmentUpdateInput = z.infer<typeof appointmentUpdateSchema>;
export type AppointmentStatusUpdateInput = z.infer<typeof appointmentStatusUpdateSchema>;
export type AppointmentRescheduleInput = z.infer<typeof appointmentRescheduleSchema>;
export type AppointmentCancelInput = z.infer<typeof appointmentCancelSchema>;
export type QuickPatientCreateInput = z.infer<typeof quickPatientCreateSchema>;
export type AppointmentStatus = (typeof appointmentStatuses)[number];
export type AppointmentType = (typeof appointmentTypes)[number];
