import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateRoleSchema = createRoleSchema.partial();

export const createPermissionSchema = z.object({
  name: z.string().min(2).max(100),
  action: z.string().min(2).max(100),
  module: z.string().min(2).max(100),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updatePermissionSchema = createPermissionSchema.partial();

export const assignPermissionSchema = z.object({
  roleId: z.string().uuid(),
  permissionId: z.string().uuid(),
});