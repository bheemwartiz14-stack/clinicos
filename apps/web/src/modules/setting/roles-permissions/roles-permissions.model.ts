import type {
  PermissionModuleItem,
  RoleCardItem,
  RolePermissionItem,
  RolesPermissionsPageModel,
  RolesPermissionsStats,
} from "./roles-permissions.types";

function groupPermissionsByModule(permissions: RolePermissionItem[]): PermissionModuleItem[] {
  const modules = permissions.reduce<Map<string, RolePermissionItem[]>>((acc, permission) => {
    const modulePermissions = acc.get(permission.module) ?? [];
    modulePermissions.push(permission);
    acc.set(permission.module, modulePermissions);
    return acc;
  }, new Map());

  return Array.from(modules.entries()).map(([module, modulePermissions]) => ({
    module,
    permissions: modulePermissions,
  }));
}

type RolesPermissionsPageModelInput = {
  assignedPermissions: number;
  permissions: RolePermissionItem[];
  roles: RoleCardItem[];
};

export function getRolesPermissionsPageModel({
  assignedPermissions,
  permissions,
  roles,
}: RolesPermissionsPageModelInput): RolesPermissionsPageModel {
  const stats: RolesPermissionsStats = {
    totalRoles: roles.length,
    activeRoles: roles.filter((role) => role.isActive).length,
    totalPermissions: permissions.length,
    assignedPermissions,
  };

  return {
    title: "Roles & Permissions",
    description: "Manage role coverage, defaults, flags, and permissions grouped by module.",
    breadcrumb: ["Workspace", "System & Admin", "Roles & Permissions"],
    roles,
    permissionModules: groupPermissionsByModule(permissions),
    stats,
  };
}
