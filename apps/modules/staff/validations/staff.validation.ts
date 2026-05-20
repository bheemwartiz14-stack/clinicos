import { z } from "zod";
import { staffRoles as rbacStaffRoles } from "@mediclinic/rbac";

export const staffRoles = rbacStaffRoles;

export const staffBaseSchema = z.object({
  branchId: z.string().uuid("Select a valid branch"),
  departmentId: z.string().uuid().optional().nullable(),
  role: z.enum(staffRoles, { required_error: "Select a role" }),
  name: z.string().trim().min(2, "Staff member name is required").max(160),
  email: z.string().trim().email("Enter a valid email address").max(255),
  username: z.string().trim().max(64).optional().nullable().transform((value) => (value === "" ? null : value)),
  phone: z.string().trim().max(32).optional().nullable().transform((value) => (value === "" ? null : value)),
  isActive: z.coerce.boolean(),
  shiftStart: z.string().trim().max(16).optional().nullable().transform((value) => (value === "" ? null : value)),
  shiftEnd: z.string().trim().max(16).optional().nullable().transform((value) => (value === "" ? null : value))
});

export const staffCreateSchema = staffBaseSchema.extend({
  password: z.string().trim().min(8, "Password must be at least 8 characters").optional().nullable().transform((value) => (value === "" ? null : value))
});

export const staffUpdateSchema = staffBaseSchema.extend({
  id: z.string().uuid(),
  password: z.string().trim().min(8, "Password must be at least 8 characters").optional().nullable().transform((value) => (value === "" ? null : value))
});

export type StaffRole = (typeof staffRoles)[number];
export type StaffCreateInput = z.infer<typeof staffCreateSchema>;
export type StaffUpdateInput = z.infer<typeof staffUpdateSchema>;
