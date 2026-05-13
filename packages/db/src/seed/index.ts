// src/seed/index.ts

import "dotenv/config";

import { seedUsers } from "./admin-user.seed.js";
import { seedAppointmentAvailability } from "./appointments.seed.js";
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

    await seedAppointmentAvailability();
    console.log("✅ Appointment availability seeding completed");

    await seedGeneralSettings();
    console.log("✅ General settings seeding completed");

    console.log("🎉 All seeding completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed");
    console.error(error);
    process.exit(1);
  }
}

main();
