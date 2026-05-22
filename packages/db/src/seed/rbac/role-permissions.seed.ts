
import { db, permissions, rolePermissions, roles } from "@mediclinic/db";
import { rolePermissionsData } from "@mediclinic/db/data/role-permissions.data";
import { eq } from "drizzle-orm";
export async function seedRolePermissions() {
  console.log("🌱 Seeding role permissions...");

  for (const [roleCode, permissionCodes] of Object.entries(
    rolePermissionsData
  )) {
    const role = await db.query.roles.findFirst({
      where: eq(roles.code, roleCode),
    });
    if (!role) {
      console.warn(`⚠️ Role not found: ${roleCode}`);
      continue;
    }
    for (const permissionCode of permissionCodes) {
      const permission = await db.query.permissions.findFirst({
        where: eq(permissions.code, permissionCode),
      });
      if (!permission) {
        console.warn(`⚠️ Permission not found: ${permissionCode}`);
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

  console.log("✅ Role permissions seeded");
}