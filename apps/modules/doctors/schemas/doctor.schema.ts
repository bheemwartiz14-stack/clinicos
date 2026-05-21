import { z } from "zod";

export const doctorSlotStatuses = ["available", "booked", "blocked", "cancelled"] as const;
export const doctorDaysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm time format");
const nullableUuid = z.string().uuid().or(z.literal("")).nullable().optional().transform((value) => value || null);
const nullableText = (max: number) => z.string().trim().max(max).optional().nullable().transform((value) => value || null);

export const doctorScheduleInputSchema = z.object({
  id: z.string().uuid().optional(),
  dayOfWeek: z.enum(doctorDaysOfWeek),
  startTime: timeSchema,
  endTime: timeSchema,
  slotDuration: z.coerce.number().int().min(5).max(240),
  isActive: z.coerce.boolean()
}).refine((value) => value.startTime < value.endTime, {
  message: "End time must be after start time",
  path: ["endTime"]
});

export const doctorConsultationSettingsInputSchema = z.object({
  consultationFee: z.coerce.number().min(0),
  followUpFee: z.coerce.number().min(0).default(0),
  followUpValidityDays: z.coerce.number().int().min(0).max(365).default(7),
  defaultSlotDuration: z.coerce.number().int().min(5).max(240).default(20),
  allowOnlineConsultation: z.coerce.boolean().default(false),
  onlineConsultationFee: z.coerce.number().min(0).default(0),
  notes: nullableText(2000)
});

export const doctorFormSchema = z.object({
  branchId: z.string().uuid("Select a branch"),
  departmentId: nullableUuid,
  specialtyId: nullableUuid,
  displayName: z.string().trim().min(2, "Display name is required").max(160),
  phone: nullableText(32),
  email: z.string().trim().email("Enter a valid email").max(255).transform((value) => value.toLowerCase()),
  qualification: nullableText(500),
  experienceYears: z.coerce.number().int().min(0).max(100).default(0),
  licenseNumber: z.string().trim().min(1, "License number is required").max(64),
  bio: nullableText(2000),
  isActive: z.coerce.boolean().default(true),
  isAvailable: z.coerce.boolean().default(true),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  consultationSettings: doctorConsultationSettingsInputSchema,
  schedules: z.array(doctorScheduleInputSchema).min(1, "Add at least one weekly schedule")
});

export const doctorCreateSchema = doctorFormSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const doctorUpdateSchema = doctorFormSchema.extend({
  id: z.string().uuid(),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal(""))
});

export type DoctorFormInput = z.infer<typeof doctorFormSchema>;
export type DoctorCreateInput = z.infer<typeof doctorCreateSchema>;
export type DoctorUpdateInput = z.infer<typeof doctorUpdateSchema>;
export type DoctorScheduleInput = z.infer<typeof doctorScheduleInputSchema>;
export type DoctorConsultationSettingsInput = z.infer<typeof doctorConsultationSettingsInputSchema>;
export type DoctorDayOfWeek = (typeof doctorDaysOfWeek)[number];
export type DoctorSlotStatus = (typeof doctorSlotStatuses)[number];
