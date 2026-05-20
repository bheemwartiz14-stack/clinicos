import { z } from "zod";

export const saveGoogleMeetSettingsSchema = z.object({
  doctorId: z.string().uuid().optional(),
  autoCreateMeetLink: z.coerce.boolean().default(true),
  defaultOnlineConsultation: z.coerce.boolean().default(false)
});

export const createGoogleMeetLinkSchema = z.object({
  doctorId: z.string().uuid(),
  appointmentId: z.string().uuid(),
  patientName: z.string().trim().min(1).max(160),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  summary: z.string().trim().max(255).default("Online consultation")
});

export type SaveGoogleMeetSettingsInput = z.infer<typeof saveGoogleMeetSettingsSchema>;
export type CreateGoogleMeetLinkInput = z.infer<typeof createGoogleMeetLinkSchema>;
