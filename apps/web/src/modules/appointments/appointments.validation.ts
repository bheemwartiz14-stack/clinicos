import { z } from "zod";

export const appointmentStatuses = [
  "booked",
  "confirmed",
  "checked_in",
  "in_queue",
  "in_consultation",
  "completed",
  "cancelled",
  "no_show",
  "rescheduled",
] as const;

export const createAppointmentSchema = z.object({
  appointmentType: z.string().trim().min(1).default("clinic"),
  availabilitySlotId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  doctorId: z.string().uuid("Select a doctor."),
  durationMinutes: z.coerce.number().int().min(5).max(240).default(15),
  notes: z.string().trim().optional(),
  onlineConsultationLink: z.string().trim().url().optional().or(z.literal("")),
  patientId: z.string().uuid("Select a patient."),
  priority: z.string().trim().min(1).default("normal"),
  reason: z.string().trim().optional(),
  recurrenceRule: z.string().trim().optional(),
  reminderChannel: z.string().trim().min(1).default("whatsapp"),
  startAt: z.coerce.date(),
  status: z.enum(appointmentStatuses).default("booked"),
});

export const queueStatuses = [
  "not_checked_in",
  "waiting",
  "called",
  "skipped",
  "completed",
] as const;

export const updateAppointmentFlowSchema = z.object({
  appointmentId: z.string().uuid("Select an appointment."),
  queueStatus: z.enum(queueStatuses),
  status: z.enum(appointmentStatuses),
});
