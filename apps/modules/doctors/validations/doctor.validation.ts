export * from "../schemas/doctor.schema";

import { z } from "zod";

export const weeklyScheduleSchema = z.object({
  doctorId: z.string().uuid(),
  schedules: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    isAvailable: z.boolean(),
    startTime: z.string(),
    endTime: z.string()
  }))
});

export const breakUpdateSchema = z.object({ doctorId: z.string().uuid(), breaks: z.array(z.unknown()) });
export const leaveBlockCreateSchema = z.object({ doctorId: z.string().uuid() }).passthrough();
export const leaveBlockUpdateSchema = leaveBlockCreateSchema.extend({ id: z.string().uuid() });
export const slotGenerationSchema = z.object({ doctorId: z.string().uuid() }).passthrough();
export const visitSettingsSchema = z.object({ doctorId: z.string().uuid() }).passthrough();
export const doctorProfileFormSchema = z.object({ id: z.string().uuid() }).passthrough();
export type DoctorProfileFormData = z.infer<typeof doctorProfileFormSchema>;
