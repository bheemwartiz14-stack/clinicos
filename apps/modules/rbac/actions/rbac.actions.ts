"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "../../../web/lib/auth";
import { permissionService } from "../services/permission.service";
import { roleService } from "../services/role.service";
import { permissionSchema, rolePermissionMatrixSchema, roleSchema } from "../validations/rbac.validation";

export type RbacActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function values(formData: FormData, key: string) {
  return formData.getAll(key).filter((value): value is string => typeof value === "string" && value.length > 0);
}

function value(formData: FormData, key: string) {
  const formValue = formData.get(key);
  return typeof formValue === "string" ? formValue : "";
}

function failure(error: unknown, fallback: string): RbacActionState {
  if (error instanceof z.ZodError) {
    return { ok: false, message: fallback, fieldErrors: error.flatten().fieldErrors };
  }
  return { ok: false, message: error instanceof Error ? error.message : fallback };
}

async function guard() {
  await requirePermission("rbac.manage");
}

export async function createRoleAction(_state: RbacActionState | null, formData: FormData): Promise<RbacActionState> {
  await guard();
  try {
    roleService.create(roleSchema.parse({ id: value(formData, "id"), description: value(formData, "description"), permissions: values(formData, "permissions") }));
    revalidatePath("/rbac/roles");
    return { ok: true, message: "Role saved." };
  } catch (error) {
    return failure(error, "Unable to save role.");
  }
}

export async function updateRolePermissionsAction(_state: RbacActionState | null, formData: FormData): Promise<RbacActionState> {
  await guard();
  try {
    roleService.updatePermissions(rolePermissionMatrixSchema.parse({ role: value(formData, "role"), permissions: values(formData, "permissions") }));
    revalidatePath("/rbac/roles");
    return { ok: true, message: "Role permissions validated against secure login RBAC." };
  } catch (error) {
    return failure(error, "Unable to update role permissions.");
  }
}

export async function deleteRoleAction(formData: FormData): Promise<RbacActionState> {
  await guard();
  try {
    roleService.delete(roleSchema.shape.id.parse(value(formData, "id")));
    revalidatePath("/rbac/roles");
    return { ok: true, message: "Role deleted." };
  } catch (error) {
    return failure(error, "Unable to delete role.");
  }
}

export async function createPermissionAction(_state: RbacActionState | null, formData: FormData): Promise<RbacActionState> {
  await guard();
  try {
    permissionService.create(permissionSchema.parse({ id: value(formData, "id"), description: value(formData, "description") }));
    revalidatePath("/rbac/permissions");
    return { ok: true, message: "Permission saved." };
  } catch (error) {
    return failure(error, "Unable to save permission.");
  }
}

export async function deletePermissionAction(formData: FormData): Promise<RbacActionState> {
  await guard();
  try {
    permissionService.delete(permissionSchema.shape.id.parse(value(formData, "id")));
    revalidatePath("/rbac/permissions");
    return { ok: true, message: "Permission deleted." };
  } catch (error) {
    return failure(error, "Unable to delete permission.");
  }
}
