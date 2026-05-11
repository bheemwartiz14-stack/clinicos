export type RolePermissionItem = {
  id: string;
  name: string;
  action: string;
  module: string;
  description: string | null;
  isActive: boolean;
};

export type RoleCardItem = {
  id: string;
  name: string;
  label: string;
  description: string | null;
  isActive: boolean;
  isDefault: boolean;
  isFullAccess: boolean;
  userCount: number;
  permissions: RolePermissionItem[];
  createdAt: Date;
  updatedAt: Date;
};

export type PermissionModuleItem = {
  module: string;
  permissions: RolePermissionItem[];
};

export type RolesPermissionsStats = {
  totalRoles: number;
  activeRoles: number;
  totalPermissions: number;
  assignedPermissions: number;
};

export type RolesPermissionsPageModel = {
  title: string;
  description: string;
  breadcrumb: string[];
  roles: RoleCardItem[];
  permissionModules: PermissionModuleItem[];
  stats: RolesPermissionsStats;
};

export type ActionState = {
  ok: boolean;
  message: string;
};
