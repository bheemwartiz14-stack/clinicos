// src/db/seeds/activity-logs.seed.ts

import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, schema } from "../index.js";

export async function seedActivityLogs() {
  console.log("🌱 Activity logs seeding started...");

  try {
    const existingActivityLog = await db.query.activityLogs.findFirst();

    if (existingActivityLog) {
      console.log("ℹ️ Activity logs already exist");
      return;
    }

    const adminUser = await db.query.users.findFirst({
      where: eq(
        schema.users.email,
        process.env.ADMIN_EMAIL || "admin@example.com",
      ),
    });

    if (!adminUser) {
      console.log("ℹ️ Admin user not found, skipping activity logs");
      return;
    }

    await db.insert(schema.activityLogs).values([
      {
        action: "seed.completed",
        module: "database",
        description: "Initial database seed completed",
        userId: adminUser.id,
        userName: adminUser.name,
        ipAddress: "127.0.0.1",
        metadata: JSON.stringify({ source: "db:seed" }),
      },
    ]);

    console.log("✅ Activity logs inserted");
    console.log("🎉 Activity logs seeding completed successfully");
  } catch (error) {
    console.error("❌ Activity logs seed failed:", error);
    throw error;
  }
}

if (import.meta.main) {
  seedActivityLogs()
    .then(() => {
      console.log("✅ Seed finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seed error:", error);
      process.exit(1);
    });
}
