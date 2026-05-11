export const roles = ["admin", "doctor", "receptionist", "user"] as const;
export type Role = (typeof roles)[number];

export const appointmentStatuses = ["scheduled", "checked_in", "completed", "cancelled"] as const;
export type AppointmentStatus = (typeof appointmentStatuses)[number];

export type Permission =
  | "dashboard.view"
  | "patients.view"
  | "patients.create"
  | "patients.edit"
  | "patients.delete"
  | "appointments.view"
  | "appointments.create"
  | "appointments.edit"
  | "appointments.delete"
  | "billing.view"
  | "billing.create"
  | "billing.edit"
  | "billing.delete"
  | "settings.manage"
  | "roles.manage"
  | "permissions.manage";

export const permissions = [
  "dashboard.view",
  "patients.view",
  "patients.create",
  "patients.edit",
  "patients.delete",
  "appointments.view",
  "appointments.create",
  "appointments.edit",
  "appointments.delete",
  "billing.view",
  "billing.create",
  "billing.edit",
  "billing.delete",
  "settings.manage",
  "roles.manage",
  "permissions.manage",
] as const satisfies readonly Permission[];

export const rolePermissions: Record<Role, Permission[]> = {
  admin: [...permissions],
  doctor: [
    "dashboard.view",
    "patients.view",
    "patients.create",
    "patients.edit",
    "appointments.view",
    "appointments.create",
    "appointments.edit",
  ],
  receptionist: [
    "dashboard.view",
    "patients.view",
    "patients.create",
    "patients.edit",
    "appointments.view",
    "appointments.create",
    "appointments.edit",
    "billing.view",
    "billing.create",
    "billing.edit",
  ],
  user: ["dashboard.view"],
};

export function hasPermission(role: Role, permission: Permission) {
  return rolePermissions[role].includes(permission);
}

export type SyncEntity = "patient" | "appointment" | "invoice" | "prescription";

export interface OfflineMutation {
  id: string;
  entity: SyncEntity;
  operation: "create" | "update" | "delete";
  payload: unknown;
  baseVersion?: number;
  createdAt: string;
}
