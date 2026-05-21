import { rolePermissions, roles, type Permission, type Role } from "@mediclinic/rbac";
import type { RbacRoleRecord, RolePermissionMatrixRow } from "../types/rbac.types";

function roleName(role: Role) {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function roleDescription(role: Role) {
  const descriptions: Record<Role, string> = {
    accountant: "Billing, payroll, reports, and account workflow access.",
    admin: "Full clinic administration, system settings, and RBAC access.",
    analyst: "Reporting and insight access with limited operational permissions.",
    doctor: "Clinical, appointment, patient chart, and doctor self-service access.",
    nurse: "Care team patient chart and appointment workflow access.",
    patient: "Patient portal access.",
    receptionist: "Front desk patient, booking, document, and billing intake access."
  };
  return descriptions[role];
}

function toRoleRecord(role: Role): RbacRoleRecord {
  return {
    id: role,
    name: roleName(role),
    description: roleDescription(role),
    permissions: rolePermissions[role],
    system: true
  };
}

export const roleRepository = {
  list(): RbacRoleRecord[] {
    return roles.map(toRoleRecord);
  },

  get(id: Role): RbacRoleRecord | null {
    return roles.includes(id) ? toRoleRecord(id) : null;
  },

  create(input: { id: Role; permissions?: Permission[]; description?: string }): RbacRoleRecord {
    const record = this.get(input.id);
    if (!record) throw new Error("Role is not registered in the secure RBAC package.");
    return {
      ...record,
      description: input.description || record.description,
      permissions: input.permissions?.length ? input.permissions : record.permissions
    };
  },

  update(input: { id: Role; permissions?: Permission[]; description?: string }): RbacRoleRecord {
    return this.create(input);
  },

  delete(id: Role): RbacRoleRecord {
    const record = this.get(id);
    if (!record) throw new Error("Role not found.");
    throw new Error(`Cannot delete system role ${record.name}. Update @mediclinic/rbac to remove secure login roles.`);
  },

  matrix(permissions: Permission[]): RolePermissionMatrixRow[] {
    return this.list().map((role) => ({
      ...role,
      permissionState: Object.fromEntries(permissions.map((permission) => [permission, role.permissions.includes(permission)])) as Record<Permission, boolean>
    }));
  }
};
