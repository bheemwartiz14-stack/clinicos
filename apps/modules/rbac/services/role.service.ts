import { roleRepository } from "../repositories/role.repository";
import { permissionRepository } from "../repositories/permission.repository";
import { rolePermissionMatrixSchema, roleSchema, type RoleInput, type RolePermissionMatrixInput } from "../validations/rbac.validation";

export const roleService = {
  list: roleRepository.list,
  get: roleRepository.get,

  overview() {
    const permissions = permissionRepository.list();
    const permissionIds = permissions.map((permission) => permission.id);
    return {
      roles: roleRepository.list(),
      permissions,
      matrix: roleRepository.matrix(permissionIds)
    };
  },

  create(input: RoleInput) {
    return roleRepository.create(roleSchema.parse(input));
  },

  update(input: RoleInput) {
    return roleRepository.update(roleSchema.parse(input));
  },

  delete(input: RoleInput["id"]) {
    return roleRepository.delete(input);
  },

  updatePermissions(input: RolePermissionMatrixInput) {
    const payload = rolePermissionMatrixSchema.parse(input);
    return roleRepository.update({ id: payload.role, permissions: payload.permissions });
  }
};
