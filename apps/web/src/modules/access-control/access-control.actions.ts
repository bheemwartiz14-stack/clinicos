"use server";

import { revalidatePath } from "next/cache";
import {
  assignPermissionToRole,
  createPermission,
  createRole,
  deletePermission,
  deleteRole,
  removePermissionFromRole,
} from "./access-control.service";

const ACCESS_CONTROL_PATH = "/dashboard/role-permissions";

export async function createRoleAction(formData: FormData) {
  await createRole({
    name: String(formData.get("name") || ""),
    description: String(formData.get("description") || ""),
  });

  revalidatePath(ACCESS_CONTROL_PATH);
}

export async function deleteRoleAction(formData: FormData) {
  const id = String(formData.get("id") || "");

  await deleteRole(id);

  revalidatePath(ACCESS_CONTROL_PATH);
}

export async function createPermissionAction(formData: FormData) {
  await createPermission({
    name: String(formData.get("name") || ""),
    action: String(formData.get("action") || ""),
    module: String(formData.get("module") || ""),
    description: String(formData.get("description") || ""),
  });

  revalidatePath(ACCESS_CONTROL_PATH);
}

export async function deletePermissionAction(formData: FormData) {
  const id = String(formData.get("id") || "");

  await deletePermission(id);

  revalidatePath(ACCESS_CONTROL_PATH);
}

export async function toggleRolePermissionAction(formData: FormData) {
  const roleId = String(formData.get("roleId") || "");
  const permissionId = String(formData.get("permissionId") || "");
  const exists = String(formData.get("exists") || "") === "true";

  if (exists) {
    await removePermissionFromRole(roleId, permissionId);
  } else {
    await assignPermissionToRole(roleId, permissionId);
  }

  revalidatePath(ACCESS_CONTROL_PATH);
}