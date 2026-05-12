// src/modules/auth/permissions.ts

export type Permission =
  // Dashboard
  | "dashboard.view"

  // Patients
  | "patients.view"
  | "patients.create"
  | "patients.edit"
  | "patients.delete"
  // Doctors
  | "doctors.view"
  | "doctors.create"
  | "doctors.edit"
  | "doctors.delete"
  | "doctors.schedule.view"
  | "doctors.leave.view"

  // Appointments
  | "appointments.view"
  | "appointments.create"
  | "appointments.edit"
  | "appointments.delete"

  // Billing
  | "billing.view"
  | "billing.create"
  | "billing.edit"
  | "billing.delete"

  // General Settings (Admin Only)
  | "general-settings.view"
  | "general-settings.create"
  | "general-settings.edit"
  | "general-settings.delete"

  // Audit Logs
  | "audit-logs.view"

  // Login History
  | "login-history.view"

  // System Management
  | "settings.manage"
  | "departments.manage"
  | "departments.view"
  | "departments.create"
  | "departments.edit"
  | "departments.delete"
  | "departments.analytics.view"
  | "branches.view"
  | "branches.create"
  | "branches.edit"
  | "branches.delete"
  | "users.manage"
  | "roles.manage"
  | "permissions.manage";

export function hasPermission(
  userPermissions: readonly string[] = [],
  permission: Permission | string,
) {
  return userPermissions.includes(permission);
}

export function hasAnyPermission(
  userPermissions: readonly string[] = [],
  permissions: readonly string[] = [],
) {
  return permissions.some((permission) =>
    hasPermission(userPermissions, permission),
  );
}

export function hasEveryPermission(
  userPermissions: readonly string[] = [],
  permissions: readonly string[] = [],
) {
  return permissions.every((permission) =>
    hasPermission(userPermissions, permission),
  );
}
