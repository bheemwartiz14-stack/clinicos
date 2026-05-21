import { z } from "zod";
import { permissions, roles } from "@mediclinic/rbac";

export const roleSchema = z.object({
  id: z.enum(roles),
  description: z.string().trim().max(240).optional().default(""),
  permissions: z.array(z.enum(permissions)).default([])
});

export const permissionSchema = z.object({
  id: z.enum(permissions),
  description: z.string().trim().max(240).optional().default("")
});

export const rolePermissionMatrixSchema = z.object({
  role: z.enum(roles),
  permissions: z.array(z.enum(permissions)).default([])
});

export type RoleInput = z.infer<typeof roleSchema>;
export type PermissionInput = z.infer<typeof permissionSchema>;
export type RolePermissionMatrixInput = z.infer<typeof rolePermissionMatrixSchema>;
