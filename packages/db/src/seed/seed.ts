import { seedRoles } from "./rbac/roles.seed";
import { seedPermissions } from "./rbac/permissions.seed";
import { seedRolePermissions } from "./rbac/role-permissions.seed";

import { seedDepartments } from "./department.seed";
import { seedUsers } from "./users.seed";

async function main() {
  try {
    console.log("🌱 Starting database seed...");
    await seedRoles();
    await seedPermissions();
    await seedRolePermissions();
    console.log("✅ All RBAC seeders completed");
    await seedDepartments();
    console.log("✅ Department seeders completed");
    await seedUsers();
    console.log("✅ Users and staff profiles seeders completed");

    console.log("🎉 Database seeding completed successfully");
  } catch (error) {
    console.error("❌ Seeder error:", error);
    process.exit(1);
  }
}

main();