import { z } from "zod";

export const genderEnum = z.enum(["male", "female", "other", "prefer_not_to_say"]);
export const leaveTypeEnum = z.enum(["full_day", "half_day", "custom_time"]);
export const leaveStatusEnum = z.enum(["pending", "approved", "rejected"]);
export const slotStatusEnum = z.enum(["available", "booked", "blocked", "lunch", "leave"]);
export const breakTypeEnum = z.enum(["lunch", "break"]);
export const visitDurationOptions = [15, 20, 30, 45, 60] as const;
export const bufferTimeOptions = [0, 5, 10, 15] as const;

function isVisitDuration(v: number): v is 15 | 20 | 30 | 45 | 60 {
  return [15, 20, 30, 45, 60].includes(v);
}

function isBufferTime(v: number): v is 0 | 5 | 10 | 15 {
  return [0, 5, 10, 15].includes(v);
}

export const doctorCreateSchema = z.object({
  userId: z.string().uuid("Select a valid user"),
  branchId: z.string().uuid("Select a valid branch"),
  departmentId: z.string().uuid().optional().nullable(),
  firstName: z.string().trim().min(1, "First name is required").max(120),
  lastName: z.string().trim().min(1, "Last name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(32).optional().nullable().transform((v) => (v === "" ? null : v)),
  gender: genderEnum.optional().nullable(),
  dateOfBirth: z.string().optional().nullable().transform((v) => (v ? new Date(v) : null)),
  specialization: z.string().trim().min(1, "Specialization is required").max(120),
  qualification: z.string().trim().max(500).optional().nullable().transform((v) => (v === "" ? null : v)),
  experienceYears: z.coerce.number().int().min(0).max(100).default(0),
  npi: z.string().trim().max(32).optional().nullable().transform((v) => (v === "" ? null : v)),
  licenseNumber: z.string().trim().min(1, "License number is required").max(64),
  consultationFee: z.coerce.number().min(0).default(0),
  bio: z.string().trim().max(2000).optional().nullable().transform((v) => (v === "" ? null : v)),
  isActive: z.coerce.boolean().default(true),
  visitDurationMinutes: z.number().refine(isVisitDuration, { message: "Invalid visit duration" }).default(20)
});

export const doctorUpdateSchema = doctorCreateSchema.extend({
  id: z.string().uuid()
});

export const weeklyScheduleSchema = z.object({
  doctorId: z.string().uuid(),
  schedules: z.array(
    z.object({
      dayOfWeek: z.number().min(0).max(6),
      isAvailable: z.boolean(),
      startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
    })
  ).length(7)
});

export const breakUpdateSchema = z.object({
  doctorId: z.string().uuid(),
  breaks: z.array(
    z.object({
      id: z.string().uuid().optional(),
      breakType: breakTypeEnum,
      breakName: z.string().trim().max(64).optional().nullable(),
      startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
      isEnabled: z.boolean()
    })
  )
});

export const visitSettingsSchema = z.object({
  doctorId: z.string().uuid(),
  visitDurationMinutes: z.number().refine(isVisitDuration, { message: "Invalid visit duration" }),
  bufferTimeMinutes: z.number().refine(isBufferTime, { message: "Invalid buffer time" }),
  maxPatientsPerDay: z.number().int().min(1).max(50),
  autoGenerateSlots: z.boolean(),
  allowOnlineConsultation: z.boolean()
});

export const leaveBlockCreateSchema = z.object({
  doctorId: z.string().uuid(),
  leaveType: leaveTypeEnum,
  fromDate: z.string().transform((v) => new Date(v)),
  toDate: z.string().transform((v) => new Date(v)),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional().nullable(),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional().nullable(),
  reason: z.string().trim().max(500).optional().nullable().transform((v) => (v === "" ? null : v))
});

export const leaveBlockUpdateSchema = leaveBlockCreateSchema.extend({
  id: z.string().uuid(),
  status: leaveStatusEnum.optional()
});

export const slotGenerationSchema = z.object({
  doctorId: z.string().uuid(),
  startDate: z.string().transform((v) => new Date(v)),
  endDate: z.string().transform((v) => new Date(v))
});

export const doctorFilterSchema = z.object({
  branchId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional()
});

export type DoctorCreateInput = z.infer<typeof doctorCreateSchema>;
export type DoctorUpdateInput = z.infer<typeof doctorUpdateSchema>;
export type WeeklyScheduleInput = z.infer<typeof weeklyScheduleSchema>;
export type BreakUpdateInput = z.infer<typeof breakUpdateSchema>;
export type VisitSettingsInput = z.infer<typeof visitSettingsSchema>;
export type LeaveBlockCreateInput = z.infer<typeof leaveBlockCreateSchema>;
export type LeaveBlockUpdateInput = z.infer<typeof leaveBlockUpdateSchema>;
export type SlotGenerationInput = z.infer<typeof slotGenerationSchema>;
export type DoctorFilterInput = z.infer<typeof doctorFilterSchema>;

export const doctorProfileFormSchema = z.object({
  id: z.string().uuid("Invalid doctor ID"),
  firstName: z.string().trim().min(1, "First name is required").max(120),
  lastName: z.string().trim().min(1, "Last name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  gender: z.string().trim().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().refine((v) => !v || !isNaN(Date.parse(v)), "Enter a valid date").refine((v) => !v || new Date(v) <= new Date(), "Date of birth cannot be in the future").or(z.literal("")),
  specialization: z.string().trim().min(1, "Specialization is required").max(120),
  qualification: z.string().trim().max(500).optional().or(z.literal("")),
  experienceYears: z.coerce.number().int().min(0, "Experience must be 0 or more").max(100, "Experience cannot exceed 100 years"),
  npi: z.string().trim().max(32).optional().or(z.literal("")),
  licenseNumber: z.string().trim().min(1, "License number is required").max(64),
  consultationFee: z.coerce.number().min(0, "Consultation fee cannot be negative"),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  isActive: z.enum(["true", "false"]).transform((v) => v === "true"),
  branchId: z.string().uuid("Select a valid branch").optional().or(z.literal("")),
  departmentId: z.string().uuid("Select a valid department").optional().or(z.literal(""))
});

export type DoctorProfileFormData = z.infer<typeof doctorProfileFormSchema>;