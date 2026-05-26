import bcrypt from "bcryptjs";

export async function getUsersData() {
  return [
    {
      firstName: "Admin",
      lastName: "User",
      username: "admin",
      email: process.env.ADMIN_EMAIL!,
      phone: "9999999999",
      passwordHash: await bcrypt.hash(
        process.env.ADMIN_PASSWORD!,
        10
      ),
      avatar: null,
      status: "active",
      emailVerified: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      roleCode: "admin",
    },

    {
      firstName: "Doctor",
      lastName: "User",
       username: "doctor",
      email: process.env.DOCTOR_EMAIL!,
      phone: "9999999998",
      passwordHash: await bcrypt.hash(
        process.env.DOCTOR_PASSWORD!,
        10
      ),
      avatar: null,
      status: "active",
      emailVerified: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      roleCode: "doctor",
    },

    {
      firstName: "Receptionist",
      lastName: "User",
       username: "receptionist",
      email: process.env.RECEPTIONIST_EMAIL!,
      phone: "9999999996",
      passwordHash: await bcrypt.hash(
        process.env.RECEPTIONIST_PASSWORD!,
        10
      ),
      avatar: null,
      status: "active",
      emailVerified: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      roleCode: "receptionist",
    },

    {
      firstName: "Accountant",
      lastName: "User",
      username: "accountant",
      email: process.env.ACCOUNTANT_EMAIL!,
      phone: "9999999995",
      passwordHash: await bcrypt.hash(
        process.env.ACCOUNTANT_PASSWORD!,
        10
      ),
      avatar: null,
      status: "active",
      emailVerified: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      roleCode: "accountant",
    },
    {
      firstName: "Nurse",
      lastName: "User",
      username: "nurse",
      email: process.env.NURSE_EMAIL! ?? "nurse@mediclinicpro.com",
      phone: "9999999994",
      passwordHash: await bcrypt.hash(
        process.env.NURSE_PASSWORD ?? "Nurse@1234",
        10
      ),
      avatar: null,
      status: "active",
      emailVerified: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      roleCode: "nurse",
    },
  ] as const;
}
