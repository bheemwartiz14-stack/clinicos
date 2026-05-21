import { permissionService } from "../services/permission.service";
import { roleService } from "../services/role.service";

export const rbacController = {
  roles: roleService.list,
  permissions: permissionService.list,
  overview: roleService.overview,
  can: permissionService.can,
  canAny: permissionService.canAny,
  filterSidebar: permissionService.filterSidebar
};
