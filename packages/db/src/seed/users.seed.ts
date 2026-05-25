import {
  db,
  roles,
  userRoles,
  users,
  staffProfiles,
  departments,
} from "@mediclinic/db";

import { getUsersData } from "@mediclinic/db/data/users.data";
import { createScopedLogger } from "@mediclinic/logger";
import { eq } from "drizzle-orm";

const logger = createScopedLogger("users-seed");

function getStaffProfileByRole(roleCode: string) {
  const code = roleCode.toLowerCase();

  const map: Record<
    string,
    {
      departmentCode: string;
      employeeCode: string;
      designation: string;
    }
  > = {
    admin: {
      departmentCode: "ADMIN",
      employeeCode: "EMP-ADMIN-001",
      designation: "Clinic Administrator",
    },
    doctor: {
      departmentCode: "GEN",
      employeeCode: "EMP-DOC-001",
      designation: "General Physician",
    },
    nurse: {
      departmentCode: "GEN",
      employeeCode: "EMP-NUR-001",
      designation: "Staff Nurse",
    },
    accountant: {
      departmentCode: "ACC",
      employeeCode: "EMP-ACC-001",
      designation: "Accountant",
    },
    receptionist: {
      departmentCode: "REC",
      employeeCode: "EMP-REC-001",
      designation: "Receptionist",
    },
  };

  return map[code];
}

export async function seedUsers() {
  logger.info("Seeding users");
  const usersData = await getUsersData();
  for (const userData of usersData) {
    const { roleCode, ...insertUserData } = userData;
    await db
      .insert(users)
      .values(insertUserData)
      .onConflictDoNothing({
        target: users.email,
      });
    const user = await db.query.users.findFirst({
      where: eq(users.email, userData.email),
    });
    if (!user) {
      logger.warn("User not found after insert", { email: userData.email });
      continue;
    }
    const role = await db.query.roles.findFirst({
      where: eq(roles.code, roleCode),
    });
    if (!role) {
      logger.warn("Role not found", { roleCode });
      continue;
    }
    await db
      .insert(userRoles)
      .values({
        userId: user.id,
        roleId: role.id,
      })
      .onConflictDoNothing();
    const staffProfileData = getStaffProfileByRole(roleCode);
    if (!staffProfileData) {
      logger.warn("Staff profile mapping not found for role", { roleCode });
      continue;
    }
    const department = await db.query.departments.findFirst({
      where: eq(departments.code, staffProfileData.departmentCode),
    });
    if (!department) {
      logger.warn("Department not found", { departmentCode: staffProfileData.departmentCode });
      continue;
    }
    await db
      .insert(staffProfiles)
      .values({
        userId: user.id,
        departmentId: department.id,
        employeeCode: staffProfileData.employeeCode,
        designation: staffProfileData.designation,
        joiningDate: new Date().toISOString().slice(0, 10),
        address: null,
        emergencyContact: null,
        isActive: true,
      })
      .onConflictDoNothing({
        target: staffProfiles.userId,
      });
  }
  logger.info("Users and staff profiles seeded");
}
