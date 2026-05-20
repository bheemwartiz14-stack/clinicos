import { z } from "zod";

export const departmentStatuses = ["active", "inactive"] as const;

export const departmentUpsertSchema = z.object({
  branchId: z.string().uuid("Select a valid branch"),
  name: z.string().trim().min(2, "Department name is required").max(120),
  code: z.string().trim().max(32).optional().or(z.literal("")).transform((value) => (value === "" ? null : value)),
  description: z.string().trim().max(2000).default(""),
  status: z.enum(departmentStatuses),
  headId: z.string().uuid().nullable().optional()
});

export const departmentUpdateSchema = departmentUpsertSchema.extend({
  id: z.string().uuid()
});

export type DepartmentStatus = (typeof departmentStatuses)[number];
export type DepartmentUpsertInput = z.infer<typeof departmentUpsertSchema>;
export type DepartmentUpdateInput = z.infer<typeof departmentUpdateSchema>;
