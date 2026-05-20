import { asc, count, eq } from "drizzle-orm";
import { branches, db, departments, doctors, users } from "@mediclinic/db";
import type { DepartmentUpsertInput, DepartmentUpdateInput } from "../validations/department.validation";
import type { DepartmentRelationCounts, DepartmentHeadOption } from "../types/department.types";

async function relationCounts(departmentId: string) {
  const [doctorCount, staffCount] = await Promise.all([
    db.select({ total: count() }).from(doctors).where(eq(doctors.departmentId, departmentId)),
    db.select({ total: count() }).from(users).where(eq(users.departmentId, departmentId))
  ]);

  return {
    doctors: doctorCount[0]?.total ?? 0,
    staff: staffCount[0]?.total ?? 0
  };
}

export type DepartmentWithRelations = Awaited<ReturnType<typeof listDepartments>>[number];

export async function listDepartments() {
  const records = await db
    .select({
      id: departments.id,
      branchId: departments.branchId,
      branchName: branches.name,
      name: departments.name,
      code: departments.code,
      description: departments.description,
      status: departments.status,
      headId: departments.headId,
      headName: users.name,
      updatedAt: departments.updatedAt
    })
    .from(departments)
    .leftJoin(branches, eq(departments.branchId, branches.id))
    .leftJoin(users, eq(departments.headId, users.id))
    .orderBy(asc(departments.name));

  return Promise.all(records.map(async (department) => ({
    ...department,
    relations: await relationCounts(department.id)
  })));
}

export async function getDepartmentById(id: string) {
  const [department] = await db
    .select({
      id: departments.id,
      branchId: departments.branchId,
      branchName: branches.name,
      name: departments.name,
      code: departments.code,
      description: departments.description,
      status: departments.status,
      headId: departments.headId,
      headName: users.name,
      updatedAt: departments.updatedAt
    })
    .from(departments)
    .leftJoin(branches, eq(departments.branchId, branches.id))
    .leftJoin(users, eq(departments.headId, users.id))
    .where(eq(departments.id, id))
    .limit(1);

  return department ? { ...department, relations: await relationCounts(department.id) } : null;
}

export async function createDepartment(input: DepartmentUpsertInput) {
  const [department] = await db.insert(departments).values(input).returning();
  return department;
}

export async function updateDepartment(input: DepartmentUpdateInput) {
  const [department] = await db
    .update(departments)
    .set(input)
    .where(eq(departments.id, input.id))
    .returning();

  return department;
}

export async function listDepartmentHeads() {
  return db
    .select({
      id: users.id,
      name: users.name,
      role: users.role,
      branchId: users.branchId,
      branchName: branches.name
    })
    .from(users)
    .leftJoin(branches, eq(users.branchId, branches.id))
    .where(eq(users.isActive, true))
    .orderBy(asc(users.name));
}
