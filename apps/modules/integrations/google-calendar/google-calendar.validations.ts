import { z } from "zod";

export const oauthCallbackSchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
  state: z.string().min(1, "State parameter is required"),
});

export const createEventSchema = z.object({
  summary: z.string().min(2, "Event summary must be at least 2 characters"),
  description: z.string().optional(),
  start: z.object({
    dateTime: z.string().datetime({ message: "Start time must be ISO 8601" }),
    timeZone: z.string().optional(),
  }),
  end: z.object({
    dateTime: z.string().datetime({ message: "End time must be ISO 8601" }),
    timeZone: z.string().optional(),
  }),
  attendees: z.array(z.object({ email: z.string().email() })).optional(),
  conferenceDataVersion: z.number().int().min(0).max(1).optional(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  eventId: z.string().min(1, "Event ID is required"),
});

export const syncAppointmentSchema = z.object({
  patientName: z.string().min(1),
  doctorName: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  reason: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  attendeeEmail: z.string().email().optional(),
});
