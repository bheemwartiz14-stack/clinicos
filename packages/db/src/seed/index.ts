// src/seed/index.ts

import "dotenv/config";

import { seedActivityLogs } from "./activity-logs.seed.js";
import { seedUsers } from "./admin-user.seed.js";
import { seedBranches } from "./branches.seed.js";
import { seedDepartments } from "./departments.seed.js";
import { seedGeneralSettings } from "./general-settings.seed.js";
import { seedRBAC } from "./rbac.seed.js";

async function main() {
  try {
    console.log("🌱 Starting database seeding...");

    await seedRBAC();
    console.log("✅ RBAC seeding completed");

    await seedDepartments();
    console.log("✅ Departments seeding completed");

    await seedBranches();
    console.log("✅ Branches seeding completed");

    await seedUsers();
    console.log("✅ Users seeding completed");

    await seedGeneralSettings();
    console.log("✅ General settings seeding completed");

    await seedActivityLogs();
    console.log("✅ Activity logs seeding completed");

    console.log("🎉 All seeding completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed");
    console.error(error);
    process.exit(1);
  }
}

main();
