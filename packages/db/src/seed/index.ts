// src/seed/index.ts

import { seedAdminUser } from "./admin-user.seed.js";
import { seedRBAC } from "./rbac.seed.js";

async function main() {
  try {
    console.log("🌱 Starting database seeding...");

    // Step 1: Seed RBAC
    await seedRBAC();
    console.log("✅ RBAC seeding completed");

    // Step 2: Seed Admin User
    await seedAdminUser();
    console.log("✅ Admin user seeding completed");

    console.log("🎉 All seeding completed successfully");
  } catch (error) {
    console.error("❌ Seeding failed");
    console.error(error);
    process.exit(1);
  }
}

main();
