import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, schema } from "../index.js";

export async function seedAdminUser() {
  console.log("🌱 Admin user seeding started...");
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
    }

    const adminRole = await db.query.roles.findFirst({
      where: eq(schema.roles.name, "admin"),
    });

    if (!adminRole) {
      throw new Error("Admin role not found. Run RBAC seed first.");
    }

    let adminUser = await db.query.users.findFirst({
      where: eq(schema.users.email, adminEmail),
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const [createdUser] = await db
        .insert(schema.users)
        .values({
          name: "Super Admin",
          email: adminEmail,
          password: hashedPassword,
          roleId: adminRole.id,
        })
        .returning();

      adminUser = createdUser;
      console.log("✅ Admin user created");
    } else {
      console.log("ℹAdmin user already exists");
    }

    const existingProfile = await db.query.userProfiles.findFirst({
      where: eq(schema.userProfiles.userId, adminUser.id),
    });

    if (existingProfile) {
      console.log("ℹAdmin profile already exists");
      return;
    }
    await db.insert(schema.userProfiles).values({
      userId: adminUser.id,
      firstName: "Super",
      lastName: "Admin",
      phone: "9999999999",
      gender: "male",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      postalCode: "110001",
    });

    console.log("✅ Admin profile created");
  } catch (error) {
    console.error("❌ Admin seed failed:", error);
    throw error;
  }
}

if (import.meta.main) {
  seedAdminUser()
    .then(() => {
      console.log("✅ Seed finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seed error:", error);
      process.exit(1);
    });
}
