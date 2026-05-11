import { z } from "zod";

export const createRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Role name is required")
    .max(100, "Role name must be 100 characters or fewer")
    .transform((value) => value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-")),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer")
    .optional()
    .transform((value) => (value ? value : undefined)),
  isActive: z.boolean().default(true),
  permissionIds: z.array(z.string().uuid()).default([]),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
