import { z } from "zod";

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  slotId: z.string().optional().or(z.literal("")),
  appointmentDate: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Time is required"),
  endTime: z.string().optional().or(z.literal("")),
  type: z.enum(["in_clinic", "online", "tele_consult", "walk_in"]).default("in_clinic"),
  status: z.enum(["booked", "confirmed", "pending", "cancelled"]).default("confirmed"),
  reason: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  recurringPattern: z.enum(["daily", "weekly", "biweekly", "monthly", "quarterly"]).optional(),
  recurringEndDate: z.string().optional().or(z.literal("")),
  consultationLink: z.string().url().optional().or(z.literal("")),
});

export const createBookingSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  doctorId: z.string().uuid("Invalid doctor ID"),
  slotId: z.string().uuid().optional().or(z.literal("")),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM").optional().or(z.literal("")),
  type: z.enum(["in_clinic", "online", "tele_consult", "walk_in"]).default("in_clinic"),
  reason: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  createdById: z.string().uuid().optional().nullable(),
});

export const updateStatusSchema = z.object({
  appointmentId: z.string().min(1),
  newStatus: z.enum(["booked", "confirmed", "checked_in", "in_consultation", "completed", "cancelled", "rescheduled", "no_show"]),
  remarks: z.string().optional().or(z.literal("")),
});

export const rescheduleSchema = z.object({
  appointmentId: z.string().min(1),
  newDate: z.string().min(1, "New date is required"),
  newStartTime: z.string().min(1, "New time is required"),
  newSlotId: z.string().optional().or(z.literal("")),
  reason: z.string().optional().or(z.literal("")),
});
