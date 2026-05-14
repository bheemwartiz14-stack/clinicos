import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db, schema } from "../index.js";

type Gender = "male" | "female" | "other";

type UserProfileSeed = {
  firstName: string;
  lastName: string;
  phone: string;
  gender: Gender;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

type AdminSeedUser = {
  roleName: "admin";
  name: string;
  username: string;
  email: string;
  password: string;
  profile: UserProfileSeed;
};

type DoctorSeedUser = {
  roleName: "doctor";
  name: string;
  username: string;
  email: string;
  password: string;
  profile: UserProfileSeed;
  doctor: {
    branchCode: string;
    departmentCode: string;
    specialization: string;
    qualification: string;
    experienceYears: number;
    consultationFee: string;
    licenseNumber: string;
  };
};

type ReceptionistSeedUser = {
  roleName: "receptionist";
  name: string;
  username: string;
  email: string;
  password: string;
  profile: UserProfileSeed;
  receptionist: {
    employeeCode: string;
    shift: string;
  };
};

type AccountantSeedUser = {
  roleName: "accountant";
  name: string;
  username: string;
  email: string;
  password: string;
  profile: UserProfileSeed;
  accountant: {
    employeeCode: string;
    designation: string;
  };
};

type SeedUser =
  | AdminSeedUser
  | DoctorSeedUser
  | ReceptionistSeedUser
  | AccountantSeedUser;

async function createUserWithProfile(userData: SeedUser) {
  const role = await db.query.roles.findFirst({
    where: eq(schema.roles.name, userData.roleName),
  });

  if (!role) {
    throw new Error(`${userData.roleName} role not found`);
  }

  let user = await db.query.users.findFirst({
    where: or(
      eq(schema.users.email, userData.email),
      eq(schema.users.username, userData.username),
    ),
  });

  if (!user) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const [createdUser] = await db
      .insert(schema.users)
      .values({
        name: userData.name,
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        roleId: role.id,
      })
      .returning();

    user = createdUser;
    console.log(`✅ ${userData.roleName} user created`);
  } else {
    console.log(`ℹ️ ${userData.roleName} user already exists`);
  }

  const existingProfile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, user.id),
  });

  if (!existingProfile) {
    await db.insert(schema.userProfiles).values({
      userId: user.id,
      ...userData.profile,
    });

    console.log(`✅ ${userData.roleName} profile created`);
  } else {
    console.log(`ℹ️ ${userData.roleName} profile already exists`);
  }

  if (userData.roleName === "doctor") {
    const branch = await db.query.branches.findFirst({
      where: eq(schema.branches.code, userData.doctor.branchCode),
    });

    if (!branch) {
      throw new Error(`Branch ${userData.doctor.branchCode} not found`);
    }

    const department = await db.query.departments.findFirst({
      where: eq(schema.departments.code, userData.doctor.departmentCode),
    });

    if (!department) {
      throw new Error(`Department ${userData.doctor.departmentCode} not found`);
    }

    const existingDoctor = await db.query.doctors.findFirst({
      where: eq(schema.doctors.userId, user.id),
    });

    if (!existingDoctor) {
      await db.insert(schema.doctors).values({
        userId: user.id,
        branchId: branch.id,
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
      where: eq(schema.receptionists.userId, user.id),
    });

    if (!existingReceptionist) {
      await db.insert(schema.receptionists).values({
        userId: user.id,
        employeeCode: userData.receptionist.employeeCode,
        shift: userData.receptionist.shift,
      });

      console.log("✅ Receptionist record created");
    } else {
      console.log("ℹ️ Receptionist record already exists");
    }
  }

  if (userData.roleName === "accountant") {
    console.log("✅ Accountant user ready");
  }
}

export async function seedUsers() {
  console.log("🌱 User seeding started...");

  await createUserWithProfile({
    roleName: "admin",
    name: "Super Admin",
    username: process.env.ADMIN_USERNAME || "admin",
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
    username: process.env.DOCTOR_USERNAME || "doctor",
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
      branchCode: process.env.CLINIC_BRANCH_CODE || "MAIN",
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
    username: process.env.RECEPTIONIST_USERNAME || "receptionist",
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

  await createUserWithProfile({
    roleName: "accountant",
    name: "Finance Accountant",
    username: process.env.ACCOUNTANT_USERNAME || "accountant",
    email: process.env.ACCOUNTANT_EMAIL || "accountant@example.com",
    password: process.env.ACCOUNTANT_PASSWORD || "Accountant@123",
    profile: {
      firstName: "Finance",
      lastName: "Manager",
      phone: "6666666666",
      gender: "male",
      city: "Ludhiana",
      state: "Punjab",
      country: "India",
      postalCode: "141001",
    },
    accountant: {
      employeeCode: "ACC-1001",
      designation: "Senior Accountant",
    },
  });

  console.log("🎉 All users seeded successfully");
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