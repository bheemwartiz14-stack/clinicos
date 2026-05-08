export const roles = ["admin", "doctor", "receptionist"] as const;
export type Role = (typeof roles)[number];

export const appointmentStatuses = ["scheduled", "checked_in", "completed", "cancelled"] as const;
export type AppointmentStatus = (typeof appointmentStatuses)[number];

export type Permission =
  | "dashboard.read"
  | "patients.read"
  | "patients.write"
  | "appointments.read"
  | "appointments.write"
  | "billing.read"
  | "billing.write"
  | "inventory.read"
  | "ai_notes.read"
  | "settings.manage"
  | "roles.manage"
  | "prescriptions.write";

export const permissions = [
  "dashboard.read",
  "patients.read",
  "patients.write",
  "appointments.read",
  "appointments.write",
  "billing.read",
  "billing.write",
  "inventory.read",
  "ai_notes.read",
  "settings.manage",
  "roles.manage",
  "prescriptions.write",
] as const satisfies readonly Permission[];

export const rolePermissions: Record<Role, Permission[]> = {
  admin: [...permissions],
  doctor: [
    "dashboard.read",
    "patients.read",
    "appointments.read",
    "appointments.write",
    "ai_notes.read",
    "prescriptions.write",
  ],
  receptionist: [
    "dashboard.read",
    "patients.read",
    "patients.write",
    "appointments.read",
    "appointments.write",
    "billing.read",
    "billing.write",
    "inventory.read",
  ],
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
