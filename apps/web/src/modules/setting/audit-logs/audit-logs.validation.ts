import { z } from "zod";

export const AuditLogsSearchSchema = z.object({
  q: z.string().optional(),
});