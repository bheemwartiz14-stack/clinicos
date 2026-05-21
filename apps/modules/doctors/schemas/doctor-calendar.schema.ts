import { z } from "zod";

export const doctorCalendarConnectSchema = z.object({
  doctorId: z.string().uuid()
});

export const doctorCalendarSyncSchema = z.object({
  doctorId: z.string().uuid(),
  daysAhead: z.coerce.number().int().min(1).max(180).default(30),
  syncType: z.enum(["manual", "automatic", "callback"]).default("manual")
});

export const doctorCalendarDisconnectSchema = z.object({
  doctorId: z.string().uuid()
});

export type DoctorCalendarConnectInput = z.infer<typeof doctorCalendarConnectSchema>;
export type DoctorCalendarSyncInput = z.infer<typeof doctorCalendarSyncSchema>;
export type DoctorCalendarDisconnectInput = z.infer<typeof doctorCalendarDisconnectSchema>;
