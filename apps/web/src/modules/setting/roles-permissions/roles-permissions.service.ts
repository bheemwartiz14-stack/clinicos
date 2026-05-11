import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { getCurrentUser } from "@/modules/auth/auth.service";
import { hasAnyPermission } from "@/modules/auth/permissions";
import { getRolesPermissionsPageModel } from "./roles-permissions.model";
import {
  countAssignedRolePermissions,
  createRole,
  findAllPermissions,
  findRolesWithPermissions,
} from "./roles-permissions.repository";
import type { ActionState } from "./roles-permissions.types";
import { createRoleSchema } from "./roles-permissions.validation";

const ROLES_PERMISSIONS_PATH = "/setting/roles-permissions";

async function requireRolesPermission() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (
    user.role !== "admin" &&
    !hasAnyPermission(user.permissions, ["roles.manage", "permissions.manage"])
  ) {
    redirect("/dashboard");
  }

  return user;
}

export async function getRolesPermissionsPageData() {
  await requireRolesPermission();

  const [roles, permissions, assignedPermissions] = await Promise.all([
    findRolesWithPermissions(),
    findAllPermissions(),
    countAssignedRolePermissions(),
  ]);

  return getRolesPermissionsPageModel({
    assignedPermissions,
    permissions,
    roles,
  });
}

function parseCreateRoleForm(formData: FormData) {
  return {
    description: formData.get("description"),
    isActive: formData.get("isActive") === "on",
    name: formData.get("name"),
    permissionIds: formData.getAll("permissionIds"),
  };
}

function getActionError(error: unknown): ActionState {
  if (error instanceof ZodError) {
    return {
      ok: false,
      message: error.issues[0]?.message ?? "Please check the role details and try again.",
    };
  }

  if (
    error instanceof Error &&
    (error.message.includes("duplicate key") || error.message.includes("unique"))
  ) {
    return {
      ok: false,
      message: "A role with this name already exists.",
    };
  }

  console.error("Create role error:", error);

  return { ok: false, message: "Unable to create role. Please try again." };
}

export async function createRoleFromForm(formData: FormData): Promise<ActionState> {
  await requireRolesPermission();

  try {
    const input = createRoleSchema.parse(parseCreateRoleForm(formData));
    const role = await createRole(input);

    if (!role) {
      return { ok: false, message: "Unable to create role." };
    }

    revalidatePath(ROLES_PERMISSIONS_PATH);

    return { ok: true, message: "Role created successfully." };
  } catch (error) {
    return getActionError(error);
  }
}
