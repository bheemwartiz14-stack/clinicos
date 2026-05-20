import { z } from "zod";

export const syncGoogleCalendarSchema = z.object({
  doctorId: z.string().uuid().optional(),
  daysAhead: z.coerce.number().int().min(1).max(120).default(30)
});

export type SyncGoogleCalendarInput = z.infer<typeof syncGoogleCalendarSchema>;
