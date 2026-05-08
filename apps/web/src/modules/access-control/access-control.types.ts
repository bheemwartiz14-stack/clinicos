export type AccessControlMode = "roles" | "permissions" | "role-permissions";
export type AssignPermissionInput = {
  roleId: string;
  permissionId: string;
};