import { desc, eq } from "drizzle-orm";
import { hashPassword } from "@mediclinic/auth";
import { db, departments, roles, staffProfiles, userRoles, users } from "@mediclinic/db";
export const staffManageRoles = ["admin", "receptionist", "accountant"] as const;
export type StaffManageRole = (typeof staffManageRoles)[number];

export type StaffInput = {
  firstName: string;
  lastName?: string | null;
  username?: string | null;
  email: string;
  phone?: string | null;
  password?: string | null;
  role: StaffManageRole;
  departmentId?: string | null;
  employeeCode?: string | null;
  designation?: string | null;
  joiningDate?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  status: "active" | "inactive" | "blocked";
};

export type StaffRecord = {
  id: string;
  userId: string;
  name: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  email: string;
  phone: string | null;
  role: string;
  departmentId: string | null;
  departmentName: string | null;
  employeeCode: string | null;
  designation: string | null;
  joiningDate: string | null;
  address: string | null;
  emergencyContact: string | null;
  status: "active" | "inactive" | "blocked";
  isActive: boolean;
};

function nameOf(user: { firstName: string; lastName: string | null }) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ");
}

function isStaffManageRole(role: string | null | undefined): role is StaffManageRole {
  return staffManageRoles.includes(role as StaffManageRole);
}

async function assignRole(userId: string, roleCode: StaffManageRole) {
  const [role] = await db.select().from(roles).where(eq(roles.code, roleCode)).limit(1);
  if (!role) throw new Error("Selected role does not exist");

  await db.delete(userRoles).where(eq(userRoles.userId, userId));
  await db.insert(userRoles).values({ userId, roleId: role.id });
}

export const staffService = {
  async listDepartments() {
    await this.ensureDefaultDepartments();
    return db.select().from(departments).orderBy(departments.name);
  },

  async ensureDefaultDepartments() {
    const defaults = [
      { name: "Administration", code: "admin" },
      { name: "Reception", code: "reception" },
      { name: "Clinical", code: "clinical" },
      { name: "Accounts", code: "accounts" }
    ];

    for (const department of defaults) {
      await db.insert(departments).values(department).onConflictDoNothing({ target: departments.name });
    }
  },

  async list(): Promise<StaffRecord[]> {
    await this.ensureDefaultDepartments();

    const rows = await db
      .select({
        profile: staffProfiles,
        user: users,
        department: departments,
        role: roles
      })
      .from(staffProfiles)
      .innerJoin(users, eq(staffProfiles.userId, users.id))
      .leftJoin(departments, eq(staffProfiles.departmentId, departments.id))
      .leftJoin(userRoles, eq(userRoles.userId, users.id))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .orderBy(desc(staffProfiles.createdAt));

    return rows
      .filter(({ role }) => isStaffManageRole(role?.code))
      .map(({ profile, user, department, role }) => ({
        id: profile.id,
        userId: user.id,
        name: nameOf(user),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: role?.code ?? "unassigned",
        departmentId: profile.departmentId,
        departmentName: department?.name ?? null,
        employeeCode: profile.employeeCode,
        designation: profile.designation,
        joiningDate: profile.joiningDate,
        address: profile.address,
        emergencyContact: profile.emergencyContact,
        status: user.status,
        isActive: profile.isActive
      }));
  },

  async get(id: string) {
    return (await this.list()).find((staff) => staff.id === id) ?? null;
  },

  async create(input: StaffInput) {
    if (!input.password) throw new Error("Password is required for new staff");

    const [user] = await db
      .insert(users)
      .values({
        firstName: input.firstName,
        lastName: input.lastName || null,
        username: input.username || null,
        email: input.email.toLowerCase(),
        phone: input.phone || null,
        passwordHash: await hashPassword(input.password),
        status: input.status,
        emailVerified: true
      })
      .returning();

    await assignRole(user.id, input.role);
    await db.insert(staffProfiles).values({
      userId: user.id,
      departmentId: input.departmentId || null,
      employeeCode: input.employeeCode || null,
      designation: input.designation || null,
      joiningDate: input.joiningDate || null,
      address: input.address || null,
      emergencyContact: input.emergencyContact || null,
      isActive: input.status === "active"
    });
  },

  async update(id: string, input: StaffInput) {
    const staff = await this.get(id);
    if (!staff) throw new Error("Staff member not found");

    await db
      .update(users)
      .set({
        firstName: input.firstName,
        lastName: input.lastName || null,
        username: input.username || null,
        email: input.email.toLowerCase(),
        phone: input.phone || null,
        status: input.status
      })
      .where(eq(users.id, staff.userId));

    await assignRole(staff.userId, input.role);
    await db
      .update(staffProfiles)
      .set({
        departmentId: input.departmentId || null,
        employeeCode: input.employeeCode || null,
        designation: input.designation || null,
        joiningDate: input.joiningDate || null,
        address: input.address || null,
        emergencyContact: input.emergencyContact || null,
        isActive: input.status === "active"
      })
      .where(eq(staffProfiles.id, id));
  },

  async deactivate(id: string) {
    const staff = await this.get(id);
    if (!staff) throw new Error("Staff member not found");
    await db.update(users).set({ status: "inactive" }).where(eq(users.id, staff.userId));
    await db.update(staffProfiles).set({ isActive: false }).where(eq(staffProfiles.id, id));
  }
};
