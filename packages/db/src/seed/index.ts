// src/seed/index.ts

import "dotenv/config";

import { seedRBAC } from "./rbac.seed.js";
import { seedUsers } from "./admin-user.seed.js";
import { seedGeneralSettings } from "./general-settings.seed.js";

async function main() {
  try {
    console.log("🌱 Starting database seeding...");
    await seedRBAC();
    console.log("RBAC seeding completed");
    await seedUsers();
    console.log("Users seeding completed");
    await seedGeneralSettings();
    console.log("General settings seeding completed");
    console.log("All seeding completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed");
    console.error(error);
    process.exit(1);
  }
}

main();