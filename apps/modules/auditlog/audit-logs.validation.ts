import { z } from "zod";

export const createAuditLogSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  action: z.string().min(1, "Action is required").max(100),
  entity: z.string().min(1, "Entity is required").max(100),
  entityId: z.string().max(100).optional().nullable(),
  oldValues: z.record(z.unknown()).optional().nullable(),
  newValues: z.record(z.unknown()).optional().nullable(),
  ipAddress: z.string().max(100).optional().nullable(),
  userAgent: z.string().optional().nullable(),
});

export const auditLogFilterSchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  entity: z.string().optional(),
  entityId: z.string().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
