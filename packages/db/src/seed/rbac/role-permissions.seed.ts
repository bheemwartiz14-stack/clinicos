
import { db, permissions, rolePermissions, roles } from "@mediclinic/db";
import { rolePermissionsData } from "@mediclinic/db/data/role-permissions.data";
import { createScopedLogger } from "@mediclinic/logger";
import { eq } from "drizzle-orm";

const logger = createScopedLogger("role-permissions-seed");

export async function seedRolePermissions() {
  logger.info("Seeding role permissions");

  for (const [roleCode, permissionCodes] of Object.entries(
    rolePermissionsData
  )) {
    const role = await db.query.roles.findFirst({
      where: eq(roles.code, roleCode),
    });
    if (!role) {
      logger.warn("Role not found", { roleCode });
      continue;
    }
    for (const permissionCode of permissionCodes) {
      const permission = await db.query.permissions.findFirst({
        where: eq(permissions.code, permissionCode),
      });
      if (!permission) {
        logger.warn("Permission not found", { permissionCode });
        continue;
      }
      await db
        .insert(rolePermissions)
        .values({
          roleId: role.id,
          permissionId: permission.id,
        })
        .onConflictDoNothing();
    }
  }

  logger.info("Role permissions seeded");
}
