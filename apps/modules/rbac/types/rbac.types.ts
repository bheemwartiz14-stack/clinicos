import type { Permission, Role } from "@mediclinic/rbac";

export type RbacRoleRecord = {
  id: Role;
  name: string;
  description: string;
  permissions: Permission[];
  system: boolean;
};

export type RbacPermissionRecord = {
  id: Permission;
  name: Permission;
  module: string;
  action: string;
  description: string;
  system: boolean;
};

export type RolePermissionMatrixRow = RbacRoleRecord & {
  permissionState: Record<Permission, boolean>;
};

export type RbacOverview = {
  roles: RbacRoleRecord[];
  permissions: RbacPermissionRecord[];
  matrix: RolePermissionMatrixRow[];
};
