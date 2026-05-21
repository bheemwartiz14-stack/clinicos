import { z } from "zod";

const appointmentCreateBaseSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  appointmentType: z.enum(["consultation", "follow_up", "emergency", "walk_in"]).default("consultation"),
  mode: z.enum(["offline", "online", "hybrid"]).default("offline"),
  consultationMode: z.enum(["offline", "online", "hybrid"]).default("offline"),
  locationType: z.enum(["clinic", "online"]).default("clinic"),
  roomId: z.string().uuid().optional().nullable(),
  insuranceId: z.string().uuid().optional().nullable(),
  insuranceVerificationStatus: z.enum(["not_verified", "pending", "verified", "rejected", "expired"]).default("not_verified"),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  reason: z.string().min(1).max(255),
  notes: z.string().max(4000).optional(),
  cptCodes: z.array(z.string().trim().min(3).max(16)).default([]),
  icd10Codes: z.array(z.string().trim().min(3).max(16)).default([]),
  queuePriority: z.enum(["routine", "priority", "emergency"]).default("routine"),
  symptoms: z.string().max(4000).optional(),
  roomNumber: z.string().max(64).optional(),
  location: z.string().max(255).optional()
});

export const appointmentCreateSchema = appointmentCreateBaseSchema.superRefine((value, ctx) => {
  if (value.consultationMode === "offline" && value.locationType !== "clinic") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["locationType"], message: "Offline appointments require a clinic location." });
  }
  if (value.consultationMode === "online" && value.locationType !== "online") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["locationType"], message: "Online appointments require an online location." });
  }
});

export const appointmentCheckInSchema = z.object({
  appointmentId: z.string().uuid(),
  priority: z.enum(["routine", "priority", "emergency"]).default("routine")
});

export const appointmentStatusUpdateSchema = z.object({
  appointmentId: z.string().uuid(),
  status: z.enum(["scheduled", "pending", "confirmed", "checked_in", "in_room", "in_consultation", "completed", "cancelled", "no_show", "rescheduled"]),
  reason: z.string().trim().max(500).optional()
});

export const appointmentRescheduleSchema = z.object({
  appointmentId: z.string().uuid(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  reason: z.string().trim().min(2).max(500).default("Schedule change"),
  notifyPatient: z.coerce.boolean().default(true)
}).refine((value) => new Date(value.endsAt) > new Date(value.startsAt), {
  path: ["endsAt"],
  message: "End time must be after start time."
});

export const appointmentCancelSchema = z.object({
  appointmentId: z.string().uuid(),
  reason: z.string().trim().min(2).max(500),
  notifyPatient: z.coerce.boolean().default(true)
});

export const appointmentWalkInSchema = appointmentCreateBaseSchema.extend({
  appointmentType: z.literal("walk_in").default("walk_in"),
  queuePriority: z.enum(["routine", "priority", "emergency"]).default("priority")
});

export const appointmentQueueUpdateSchema = z.object({
  appointmentId: z.string().uuid(),
  queueStatus: z.enum(["waiting", "called", "in_consultation", "skipped", "completed"])
});

export const appointmentSlotGenerationSchema = z.object({
  doctorId: z.string().uuid(),
  date: z.string().date(),
  visitDurationMinutes: z.coerce.number().min(5).max(180).default(20),
  bufferMinutes: z.coerce.number().min(0).max(60).default(5)
});

export const onlineConsultationSchema = z.object({
  appointmentId: z.string().uuid(),
  doctorId: z.string().uuid()
});

export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;
export type AppointmentCheckInInput = z.infer<typeof appointmentCheckInSchema>;
export type AppointmentStatusUpdateInput = z.infer<typeof appointmentStatusUpdateSchema>;
export type AppointmentRescheduleInput = z.infer<typeof appointmentRescheduleSchema>;
export type AppointmentCancelInput = z.infer<typeof appointmentCancelSchema>;
export type AppointmentWalkInInput = z.infer<typeof appointmentWalkInSchema>;
export type AppointmentQueueUpdateInput = z.infer<typeof appointmentQueueUpdateSchema>;
export type AppointmentSlotGenerationInput = z.infer<typeof appointmentSlotGenerationSchema>;
export type OnlineConsultationInput = z.infer<typeof onlineConsultationSchema>;

export const appointmentBookingFormSchema = z.object({
  patientId: z.string().uuid("Select a patient"),
  doctorId: z.string().uuid("Select a doctor"),
  mode: z.enum(["offline", "online", "hybrid"]).default("offline"),
  consultationMode: z.enum(["offline", "online", "hybrid"]).default("offline"),
  locationType: z.enum(["clinic", "online"]).default("clinic"),
  startsAt: z.string().min(1, "Start time is required").refine((v) => new Date(v) > new Date(), "Appointment must be in the future"),
  durationMinutes: z.coerce.number().min(15, "Minimum 15 minutes").max(120, "Maximum 120 minutes").default(30),
  reason: z.string().trim().min(1, "Reason is required").max(255),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
  queuePriority: z.enum(["routine", "priority", "emergency"]).default("routine"),
  appointmentType: z.enum(["consultation", "follow_up", "emergency", "walk_in"]).default("consultation"),
  symptoms: z.string().trim().max(4000).optional().or(z.literal("")),
  icd10Codes: z.string().trim().optional().or(z.literal(""))
});

export type AppointmentBookingFormData = z.infer<typeof appointmentBookingFormSchema>;
