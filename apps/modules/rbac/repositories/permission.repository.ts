import { permissions, type Permission } from "@mediclinic/rbac";
import type { RbacPermissionRecord } from "../types/rbac.types";

function sentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}

function toPermissionRecord(permission: Permission): RbacPermissionRecord {
  const [module = "system", action = "manage"] = permission.split(".");
  return {
    id: permission,
    name: permission,
    module,
    action,
    description: `${sentenceCase(action)} access for ${module.replace(/_/g, " ")} workflows.`,
    system: true
  };
}

export const permissionRepository = {
  list(): RbacPermissionRecord[] {
    return permissions.map(toPermissionRecord);
  },

  get(id: Permission): RbacPermissionRecord | null {
    return permissions.includes(id) ? toPermissionRecord(id) : null;
  },

  create(input: { id: Permission; description?: string }): RbacPermissionRecord {
    const record = this.get(input.id);
    if (!record) throw new Error("Permission is not registered in the secure RBAC package.");
    return { ...record, description: input.description || record.description };
  },

  update(input: { id: Permission; description?: string }): RbacPermissionRecord {
    return this.create(input);
  },

  delete(id: Permission): RbacPermissionRecord {
    const record = this.get(id);
    if (!record) throw new Error("Permission not found.");
    throw new Error(`Cannot delete system permission ${record.name}. Update @mediclinic/rbac to remove secure login permissions.`);
  }
};
