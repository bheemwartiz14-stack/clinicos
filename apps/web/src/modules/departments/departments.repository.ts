import { db, schema } from "@mediclinicpro/db";
import { count, desc, eq, ilike, or } from "drizzle-orm";
import type {
  DepartmentInput,
  DepartmentListItem,
  UpdateDepartmentInput,
} from "./departments.types";

type FindDepartmentsOptions = {
  query?: string;
  limit?: number;
};

type DepartmentRow = typeof schema.departments.$inferSelect;

type DepartmentWithHeadRow = {
  department: DepartmentRow;
  departmentHeadFirstName: string | null;
  departmentHeadLastName: string | null;
  departmentHeadEmail: string | null;
};

function getDepartmentHeadName(row: DepartmentWithHeadRow) {
  const fullName = [
    row.departmentHeadFirstName,
    row.departmentHeadLastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || row.departmentHeadEmail || null;
}

function mapDepartment(row: DepartmentRow): DepartmentListItem {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    departmentHeadId: row.departmentHeadId,
    departmentHeadName: null,
    description: row.description,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapDepartmentWithHead(row: DepartmentWithHeadRow): DepartmentListItem {
  return {
    id: row.department.id,
    name: row.department.name,
    code: row.department.code,
    departmentHeadId: row.department.departmentHeadId,
    departmentHeadName: getDepartmentHeadName(row),
    description: row.department.description,
    isActive: row.department.isActive,
    createdAt: row.department.createdAt,
    updatedAt: row.department.updatedAt,
  };
}

function buildDepartmentSearch(query?: string) {
  const normalizedQuery = query?.trim();

  if (!normalizedQuery) {
    return undefined;
  }

  const search = `%${normalizedQuery}%`;

  return or(
    ilike(schema.departments.name, search),
    ilike(schema.departments.code, search),
    ilike(schema.departments.description, search),
  );
}

export async function findDepartments({
  limit = 50,
  query,
}: FindDepartmentsOptions = {}): Promise<DepartmentListItem[]> {
  const departments = await db
    .select({
      department: schema.departments,
      departmentHeadFirstName: schema.userProfiles.firstName,
      departmentHeadLastName: schema.userProfiles.lastName,
      departmentHeadEmail: schema.users.email,
    })
    .from(schema.departments)
    .leftJoin(
      schema.users,
      eq(schema.departments.departmentHeadId, schema.users.id),
    )
    .leftJoin(
      schema.userProfiles,
      eq(schema.users.id, schema.userProfiles.userId),
    )
    .where(buildDepartmentSearch(query))
    .orderBy(desc(schema.departments.updatedAt))
    .limit(limit);

  return departments.map(mapDepartmentWithHead);
}

export async function countDepartments(query?: string) {
  const [result] = await db
    .select({ value: count() })
    .from(schema.departments)
    .where(buildDepartmentSearch(query));

  return Number(result?.value ?? 0);
}

export async function countActiveDepartments() {
  const [result] = await db
    .select({ value: count() })
    .from(schema.departments)
    .where(eq(schema.departments.isActive, true));

  return Number(result?.value ?? 0);
}

export async function createDepartment(input: DepartmentInput) {
  const [department] = await db
    .insert(schema.departments)
    .values({
      name: input.name,
      code: input.code ?? null,
      departmentHeadId: input.departmentHeadId ?? null,
      description: input.description ?? null,
      isActive: input.isActive,
    })
    .returning();

  return department ? mapDepartment(department) : null;
}

export async function updateDepartment(input: UpdateDepartmentInput) {
  const [department] = await db
    .update(schema.departments)
    .set({
      name: input.name,
      code: input.code ?? null,
      departmentHeadId: input.departmentHeadId ?? null,
      description: input.description ?? null,
      isActive: input.isActive,
      updatedAt: new Date(),
    })
    .where(eq(schema.departments.id, input.id))
    .returning();

  return department ? mapDepartment(department) : null;
}

export async function deleteDepartment(id: string) {
  const [department] = await db
    .delete(schema.departments)
    .where(eq(schema.departments.id, id))
    .returning({
      id: schema.departments.id,
      name: schema.departments.name,
    });

  return department ?? null;
}