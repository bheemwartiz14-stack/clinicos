import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, schema } from "../index.js";

type SeedUser = {
  roleName: string;
  name: string;
  email: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
    gender: "male" | "female" | "other";
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
};

async function createUserWithProfile(userData: SeedUser) {
  const existingRole = await db.query.roles.findFirst({
    where: eq(schema.roles.name, userData.roleName),
  });

  if (!existingRole) {
    throw new Error(`${userData.roleName} role not found`);
  }

  let existingUser = await db.query.users.findFirst({
    where: eq(schema.users.email, userData.email),
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const [createdUser] = await db
      .insert(schema.users)
      .values({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        roleId: existingRole.id,
      })
      .returning();

    existingUser = createdUser;

    console.log(`✅ ${userData.roleName} user created`);
  } else {
    console.log(`ℹ️ ${userData.roleName} user already exists`);
  }

  const existingProfile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, existingUser.id),
  });

  if (!existingProfile) {
    await db.insert(schema.userProfiles).values({
      userId: existingUser.id,
      ...userData.profile,
    });
    console.log(`${userData.roleName} profile created`);
  } else {
    console.log(`ℹ${userData.roleName} profile already exists`);
  }
}

export async function seedUsers() {
  console.log("🌱 User seeding started...");

  try {
    await createUserWithProfile({
      roleName: "admin",
      name: "Super Admin",
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      password: process.env.ADMIN_PASSWORD || "Admin@123",
      profile: {
        firstName: "Super",
        lastName: "Admin",
        phone: "9999999999",
        gender: "male",
        city: "Delhi",
        state: "Delhi",
        country: "India",
        postalCode: "110001",
      },
    });

    await createUserWithProfile({
      roleName: "doctor",
      name: "Dr John",
      email: process.env.DOCTOR_EMAIL || "doctor@example.com",
      password: process.env.DOCTOR_PASSWORD || "Doctor@123",
      profile: {
        firstName: "John",
        lastName: "Doctor",
        phone: "8888888888",
        gender: "male",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        postalCode: "400001",
      },
    });

    await createUserWithProfile({
      roleName: "receptionist",
      name: "Reception User",
      email:
        process.env.RECEPTIONIST_EMAIL ||
        "receptionist@example.com",
      password:
        process.env.RECEPTIONIST_PASSWORD ||
        "Reception@123",
      profile: {
        firstName: "Reception",
        lastName: "User",
        phone: "7777777777",
        gender: "female",
        city: "Chandigarh",
        state: "Punjab",
        country: "India",
        postalCode: "160001",
      },
    });

    console.log("✅ All users seeded successfully");
  } catch (error) {
    console.error("❌ User seed failed:", error);
    throw error;
  }
}

if (import.meta.main) {
  seedUsers()
    .then(() => {
      console.log("Seed finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seed error:", error);
      process.exit(1);
    });
}