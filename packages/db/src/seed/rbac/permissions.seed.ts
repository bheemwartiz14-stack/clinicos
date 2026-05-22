import { db, permissions } from "@mediclinic/db";
import { permissionsData } from "@mediclinic/db/data/permissions.data";
export async function seedPermissions() {
  console.log("🌱 Seeding permissions...");

  await db
    .insert(permissions)
    .values(permissionsData)
    .onConflictDoNothing({
      target: permissions.code,
    });

  console.log("✅ Permissions seeded");
}