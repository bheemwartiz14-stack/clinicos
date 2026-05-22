import { rolesData } from "@mediclinic/db/data/roles.data";
import { permissionsData } from "@mediclinic/db/data/permissions.data";
import { rolePermissionsData } from "@mediclinic/db/data/role-permissions.data";

// ============================================================================
// ROLES
// ============================================================================

export type Role = (typeof rolesData)[number]["code"];

export const roles = rolesData.map(
  (role) => role.code
) as Role[];

// ============================================================================
// STAFF ROLES
// ============================================================================

export const staffRoles = roles;

export type StaffRole = Role;

// ============================================================================
// PERMISSIONS
// ============================================================================

export type Permission = (typeof permissionsData)[number]["code"];
export const rolePermissions = rolePermissionsData as Record<Role, Permission[]>;
// ============================================================================
// HELPERS
// ============================================================================

export function can(
  role: Role,
  permission: Permission
): boolean {
  return (
    rolePermissions[role]?.includes(permission) ??
    false
  );
}

export function canAny(
  role: Role,
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some((permission) =>
    can(role, permission)
  );
}

export function filterByPermission<
  T extends {
    permission?: Permission;
    permissions?: Permission[];
  }
>(
  role: Role,
  items: T[]
): T[] {
  return items.filter((item) => {
    const requiredPermissions =
      item.permissions ??
      (item.permission ? [item.permission] : []);

    return (
      requiredPermissions.length === 0 ||
      canAny(role, requiredPermissions)
    );
  });
}
