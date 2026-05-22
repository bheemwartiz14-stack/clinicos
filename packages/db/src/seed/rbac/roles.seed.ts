import { db, roles } from "@mediclinic/db";
import { rolesData } from "@mediclinic/db/data/roles.data";




export async function seedRoles() {
  console.log("🌱 Seeding roles...");

  await db
    .insert(roles)
    .values(rolesData)
    .onConflictDoNothing({
      target: roles.code,
    });

  console.log("✅ Roles seeded");
}
