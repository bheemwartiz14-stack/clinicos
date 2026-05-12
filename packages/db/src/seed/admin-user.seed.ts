// src/db/seeds/users.seed.ts

import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, schema } from "../index.js";

type Gender = "male" | "female" | "other";

type BaseSeedUser = {
  roleName: "admin" | "doctor" | "receptionist";
  name: string;
  email: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
    gender: Gender;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
};

type DoctorSeedUser = BaseSeedUser & {
  roleName: "doctor";
  doctor: {
    departmentCode: string;
    specialization: string;
    qualification: string;
    experienceYears: number;
    consultationFee: string;
    licenseNumber: string;
  };
};

type ReceptionistSeedUser = BaseSeedUser & {
  roleName: "receptionist";
  receptionist: {
    employeeCode: string;
    shift: string;
  };
};

type AdminSeedUser = BaseSeedUser & {
  roleName: "admin";
};

type SeedUser = AdminSeedUser | DoctorSeedUser | ReceptionistSeedUser;

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

    console.log(`✅ ${userData.roleName} profile created`);
  } else {
    console.log(`ℹ️ ${userData.roleName} profile already exists`);
  }

  if (userData.roleName === "doctor") {
    const department = await db.query.departments.findFirst({
      where: eq(schema.departments.code, userData.doctor.departmentCode),
    });

    if (!department) {
      throw new Error(`Department with code ${userData.doctor.departmentCode} not found`);
    }

    const existingDoctor = await db.query.doctors.findFirst({
      where: eq(schema.doctors.userId, existingUser.id),
    });

    if (!existingDoctor) {
      await db.insert(schema.doctors).values({
        userId: existingUser.id,
        departmentId: department.id,
        specialization: userData.doctor.specialization,
        qualification: userData.doctor.qualification,
        experienceYears: userData.doctor.experienceYears,
        consultationFee: userData.doctor.consultationFee,
        licenseNumber: userData.doctor.licenseNumber,
      });

      console.log("✅ Doctor record created");
    } else {
      console.log("ℹ️ Doctor record already exists");
    }
  }

  if (userData.roleName === "receptionist") {
    const existingReceptionist = await db.query.receptionists.findFirst({
      where: eq(schema.receptionists.userId, existingUser.id),
    });

    if (!existingReceptionist) {
      await db.insert(schema.receptionists).values({
        userId: existingUser.id,
        employeeCode: userData.receptionist.employeeCode,
        shift: userData.receptionist.shift,
      });

      console.log("✅ Receptionist record created");
    } else {
      console.log("ℹ️ Receptionist record already exists");
    }
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
      name: "Dr John Doctor",
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
      doctor: {
        departmentCode: "GEN-MED",
        specialization: "General Physician",
        qualification: "MBBS",
        experienceYears: 8,
        consultationFee: "500",
        licenseNumber: "DOC-MH-1001",
      },
    });

    await createUserWithProfile({
      roleName: "receptionist",
      name: "Reception User",
      email: process.env.RECEPTIONIST_EMAIL || "receptionist@example.com",
      password: process.env.RECEPTIONIST_PASSWORD || "Reception@123",
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
      receptionist: {
        employeeCode: "REC-1001",
        shift: "morning",
      },
    });

    console.log("🎉 All users seeded successfully");
  } catch (error) {
    console.error("❌ User seed failed:", error);
    throw error;
  }
}

if (import.meta.main) {
  seedUsers()
    .then(() => {
      console.log("✅ Seed finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seed error:", error);
      process.exit(1);
    });
}
