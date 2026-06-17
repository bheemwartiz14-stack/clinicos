import { z } from "zod";

export const markAsReadSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "At least one notification ID is required"),
});

export const notificationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  filter: z.enum(["all", "read", "unread"]).default("all"),
});

export const createNotificationSchema = z.object({
  subject: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  body: z.string().nullable().optional(),
  userId: z.string().uuid(),
  status: z.enum(["queued", "sent", "failed"]).default("queued"),
}).transform((data) => ({
  ...data,
  subject: data.subject ?? null,
  description: data.description ?? null,
  body: data.body ?? null,
}));
