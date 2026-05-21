import { can, canAny, filterByPermission, type Permission, type Role } from "@mediclinic/rbac";
import { permissionRepository } from "../repositories/permission.repository";
import { permissionSchema, type PermissionInput } from "../validations/rbac.validation";

export const permissionService = {
  list: permissionRepository.list,
  get: permissionRepository.get,

  create(input: PermissionInput) {
    return permissionRepository.create(permissionSchema.parse(input));
  },

  update(input: PermissionInput) {
    return permissionRepository.update(permissionSchema.parse(input));
  },

  delete(permission: Permission) {
    return permissionRepository.delete(permission);
  },

  can(role: Role, permission: Permission) {
    return can(role, permission);
  },

  canAny(role: Role, permissions: Permission[]) {
    return canAny(role, permissions);
  },

  filterSidebar<T extends { permission?: Permission; permissions?: Permission[] }>(role: Role, items: T[]) {
    return filterByPermission(role, items);
  }
};
