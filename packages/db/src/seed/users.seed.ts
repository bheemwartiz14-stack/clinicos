import {
  db,
  roles,
  users,
  staffProfiles,
  departments,
  doctors,
  doctorSpecialties,
  doctorSchedules,
  doctorAvailabilitySlots,
  doctorSalaryStructures,
} from "@mediclinic/db";

import { getUsersData } from "@mediclinic/db/data/users.data";
import { createScopedLogger } from "@mediclinic/logger";
import { eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

type UserRow = InferSelectModel<typeof users>;
type RoleRow = InferSelectModel<typeof roles>;
type DepartmentRow = InferSelectModel<typeof departments>;
type SpecialtyRow = InferSelectModel<typeof doctorSpecialties>;

const logger = createScopedLogger("users-seed");

const STAFF_ROLES = ["admin", "receptionist", "accountant", "nurse"] as const;

type StaffRoleCode = (typeof STAFF_ROLES)[number];

interface StaffProfileMapping {
  departmentCode: string;
  employeeCode: string;
  designation: string;
}

const STAFF_PROFILE_MAP: Record<StaffRoleCode, StaffProfileMapping> = {
  admin: {
    departmentCode: "ADMIN",
    employeeCode: "EMP-ADMIN-001",
    designation: "Clinic Administrator",
  },
  receptionist: {
    departmentCode: "REC",
    employeeCode: "EMP-REC-001",
    designation: "Receptionist",
  },
  accountant: {
    departmentCode: "ACC",
    employeeCode: "EMP-ACC-001",
    designation: "Accountant",
  },
  nurse: {
    departmentCode: "GEN",
    employeeCode: "EMP-NUR-001",
    designation: "Staff Nurse",
  },
};

async function lookupRole(roleCode: string): Promise<RoleRow | null> {
  const role = await db.query.roles.findFirst({
    where: eq(roles.code, roleCode),
  });
  return role ?? null;
}

async function lookupDepartment(code: string): Promise<DepartmentRow | null> {
  const dept = await db.query.departments.findFirst({
    where: eq(departments.code, code),
  });
  return dept ?? null;
}

async function lookupSpecialty(code: string): Promise<SpecialtyRow | null> {
  const spec = await db.query.doctorSpecialties.findFirst({
    where: eq(doctorSpecialties.code, code),
  });
  return spec ?? null;
}

async function insertUser(
  userData: Record<string, unknown>,
  roleId: string,
): Promise<UserRow | null> {
  const { roleCode: _roleCode, ...insertData } = userData;

  await db
    .insert(users)
    .values({ ...insertData, roleId } as typeof users.$inferInsert)
    .onConflictDoNothing({ target: users.email });

  const user = await db.query.users.findFirst({
    where: eq(users.email, userData.email as string),
  });

  return user ?? null;
}

async function seedStaffUser(
  user: UserRow,
  roleCode: string,
): Promise<void> {
  const mapping = STAFF_PROFILE_MAP[roleCode as StaffRoleCode];
  if (!mapping) {
    logger.warn("No staff profile mapping for role", { roleCode });
    return;
  }

  const department = await lookupDepartment(mapping.departmentCode);
  if (!department) {
    logger.warn("Department not found for staff profile", {
      departmentCode: mapping.departmentCode,
    });
    return;
  }

  await db
    .insert(staffProfiles)
    .values({
      userId: user.id,
      departmentId: department.id,
      employeeCode: mapping.employeeCode,
      designation: mapping.designation,
      joiningDate: new Date().toISOString().slice(0, 10),
      isActive: true,
    })
    .onConflictDoNothing({ target: staffProfiles.userId });

  logger.info("Staff profile created", {
    email: user.email,
    role: roleCode,
    designation: mapping.designation,
  });
}

async function seedDoctorUser(user: UserRow): Promise<void> {
  const department = await lookupDepartment("GEN");
  if (!department) {
    logger.warn("General Medicine department not found, skipping doctor profile");
    return;
  }

  const specialty = await lookupSpecialty("general");
  if (!specialty) {
    logger.warn("General Medicine specialty not found, skipping doctor profile");
    return;
  }

  const [doctor] = await db
    .insert(doctors)
    .values({
      userId: user.id,
      departmentId: department.id,
      specialtyId: specialty.id,
      qualification: "MBBS",
      experienceYears: 5,
      licenseNumber: `LIC-${user.id.slice(0, 6).toUpperCase()}`,
      consultationFee: "500",
      bio: "General Physician",
      isAvailable: true,
    })
    .onConflictDoNothing({ target: doctors.userId })
    .returning();

  const doctorId = doctor?.id;
  if (!doctorId) {
    logger.warn("Doctor record not created", { userId: user.id });
    return;
  }

  await db.insert(doctorSchedules).values(
    Array.from({ length: 6 }, (_, i) => ({
      doctorId,
      dayOfWeek: i + 1,
      startTime: "10:00",
      endTime: "17:00",
      slotDurationMinutes: 30,
      isActive: true,
    })),
  );

  const today = new Date();
  const slots: (typeof doctorAvailabilitySlots.$inferInsert)[] = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    slots.push({
      doctorId,
      slotDate: date.toISOString().slice(0, 10),
      startTime: "10:00",
      endTime: "10:30",
      isBooked: false,
      isBlocked: false,
    });
  }
  await db.insert(doctorAvailabilitySlots).values(slots);

  await db
    .insert(doctorSalaryStructures)
    .values({
      doctorId,
      salaryType: "fixed_plus_commission",
      fixedSalary: "50000",
      commissionPercentage: "30",
      isActive: true,
    })
    .onConflictDoNothing();

  logger.info("Doctor profile + schedule + salary seeded", {
    email: user.email,
    doctorId,
  });
}

export async function seedUsers(): Promise<void> {
  logger.info("Seeding users");

  const usersData = await getUsersData();

  for (const userData of usersData) {
    const roleCode = (userData as { roleCode: string }).roleCode;
    const role = await lookupRole(roleCode);

    if (!role) {
      logger.warn("Role not found, skipping user", { roleCode });
      continue;
    }

    const user = await insertUser(userData as Record<string, unknown>, role.id);
    if (!user) {
      logger.warn("User not created (may already exist)", {
        email: (userData as { email: string }).email,
      });
      continue;
    }

    if (roleCode === "doctor") {
      await seedDoctorUser(user);
    } else {
      await seedStaffUser(user, roleCode);
    }
  }

  logger.info("User seeding completed");
}
