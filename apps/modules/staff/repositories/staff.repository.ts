import { and, asc, eq, ne } from "drizzle-orm";
import { branches, departments, db, doctors, users } from "@mediclinic/db";
import type { StaffCreateInput, StaffUpdateInput } from "../validations/staff.validation";

type StaffRepositoryCreateInput = Omit<StaffCreateInput, "password"> & { passwordHash: string };
type StaffRepositoryUpdateInput = Omit<StaffUpdateInput, "password"> & { passwordHash?: string };

export async function listStaff() {
  return db
    .select({
      id: users.id,
      branchId: users.branchId,
      branchName: branches.name,
      departmentId: users.departmentId,
      departmentName: departments.name,
      role: users.role,
      name: users.name,
      email: users.email,
      username: users.username,
      phone: users.phone,
      isActive: users.isActive,
      shiftStart: users.shiftStart,
      shiftEnd: users.shiftEnd,
      lastLoginAt: users.lastLoginAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .leftJoin(branches, eq(users.branchId, branches.id))
    .leftJoin(departments, eq(users.departmentId, departments.id))
    .where(ne(users.role, "patient"))
    .orderBy(asc(users.name));
}

export async function getStaffById(id: string) {
  const [staff] = await db
    .select({
      id: users.id,
      branchId: users.branchId,
      branchName: branches.name,
      departmentId: users.departmentId,
      departmentName: departments.name,
      role: users.role,
      name: users.name,
      email: users.email,
      username: users.username,
      phone: users.phone,
      isActive: users.isActive,
      shiftStart: users.shiftStart,
      shiftEnd: users.shiftEnd,
      lastLoginAt: users.lastLoginAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .leftJoin(branches, eq(users.branchId, branches.id))
    .leftJoin(departments, eq(users.departmentId, departments.id))
    .where(and(eq(users.id, id), ne(users.role, "patient")))
    .limit(1);

  return staff ?? null;
}

export async function createStaff(input: StaffRepositoryCreateInput) {
  return db.transaction(async (tx) => {
    const [staff] = await tx
      .insert(users)
      .values({
        branchId: input.branchId,
        departmentId: input.departmentId ?? null,
        role: input.role,
        name: input.name,
        email: input.email,
        username: input.username ?? null,
        phone: input.phone ?? null,
        isActive: input.isActive,
        shiftStart: input.shiftStart ?? null,
        shiftEnd: input.shiftEnd ?? null,
        passwordHash: input.passwordHash
      })
      .returning();

    if (staff?.role === "doctor") {
      await tx.insert(doctors).values({
        userId: staff.id,
        branchId: staff.branchId,
        departmentId: staff.departmentId,
        firstName: staff.name.split(" ")[0] || "Doctor",
        lastName: staff.name.split(" ").slice(1).join(" ") || "User",
        email: staff.email,
        specialization: "General Medicine",
        licenseNumber: "Pending",
        visitDurationMinutes: 20
      });
    }

    return staff;
  });
}

export async function updateStaff(input: StaffRepositoryUpdateInput) {
  return db.transaction(async (tx) => {
    const [staff] = await tx
      .update(users)
      .set({
        branchId: input.branchId,
        departmentId: input.departmentId ?? null,
        role: input.role,
        name: input.name,
        email: input.email,
        username: input.username ?? null,
        phone: input.phone ?? null,
        isActive: input.isActive,
        shiftStart: input.shiftStart ?? null,
        shiftEnd: input.shiftEnd ?? null,
        updatedAt: new Date(),
        ...(input.passwordHash ? { passwordHash: input.passwordHash } : {})
      })
      .where(eq(users.id, input.id))
      .returning();

    if (staff?.role === "doctor") {
      const [existingDoctor] = await tx.select({ id: doctors.id }).from(doctors).where(eq(doctors.userId, staff.id)).limit(1);
      if (existingDoctor) {
        await tx
          .update(doctors)
          .set({
            branchId: staff.branchId,
            departmentId: staff.departmentId,
            updatedAt: new Date()
          })
          .where(eq(doctors.userId, staff.id));
      } else {
        await tx.insert(doctors).values({
          userId: staff.id,
          branchId: staff.branchId,
          departmentId: staff.departmentId,
          firstName: staff.name.split(" ")[0] || "Doctor",
          lastName: staff.name.split(" ").slice(1).join(" ") || "User",
          email: staff.email,
          specialization: "General Medicine",
          licenseNumber: "Pending",
          visitDurationMinutes: 20
        });
      }
    }

    return staff;
  });
}

export async function deleteStaffById(id: string) {
  const [deleted] = await db.delete(users).where(eq(users.id, id)).returning();
  return deleted ?? null;
}
