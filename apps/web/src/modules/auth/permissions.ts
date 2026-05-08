export type Permission =
  | "dashboard.read"
  | "patients.read"
  | "appointments.read"
  | "billing.read"
  | "prescriptions.write"
  | "inventory.read"
  | "ai_notes.read"
  | "roles.manage"
  | "settings.manage";

export function hasPermission(
  userPermissions: Permission[] = [],
  permission: Permission,
) {
  return userPermissions.includes(permission);
}