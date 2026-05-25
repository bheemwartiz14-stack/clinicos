import { and, count, desc, eq, ilike, inArray, or, type SQL } from "drizzle-orm";
import { db, departments, doctorSpecialties, doctors } from "@mediclinic/db";

export type SpecialtyRecord = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  departmentId: string | null;
  departmentName: string | null;
  doctorCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SpecialtyInput = {
  name: string;
  code?: string | null;
  description?: string | null;
  departmentId: string;
  isActive?: boolean;
};

export type SpecialtyListFilters = {
  search?: string;
  departmentId?: string;
  status?: "active" | "inactive" | "";
  page?: number;
  perPage?: number;
};

export const specialtyService = {
  async list(): Promise<SpecialtyRecord[]> {
    return (await this.listPaginated({ perPage: 1000 })).data;
  },

  async listPaginated(filters: SpecialtyListFilters = {}): Promise<{
    data: SpecialtyRecord[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  }> {
    const page = Math.max(filters.page ?? 1, 1);
    const perPage = Math.min(Math.max(filters.perPage ?? 10, 1), 50);
    const conditions: SQL[] = [];
    const search = filters.search?.trim();

    if (search) {
      conditions.push(
        or(
          ilike(doctorSpecialties.name, `%${search}%`),
          ilike(doctorSpecialties.code, `%${search}%`),
          ilike(doctorSpecialties.description, `%${search}%`),
          ilike(departments.name, `%${search}%`)
        ) as SQL
      );
    }

    if (filters.departmentId) {
      conditions.push(eq(doctorSpecialties.departmentId, filters.departmentId));
    }

    if (filters.status === "active") {
      conditions.push(eq(doctorSpecialties.isActive, true));
    } else if (filters.status === "inactive") {
      conditions.push(eq(doctorSpecialties.isActive, false));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [totalResult] = await db
      .select({ total: count() })
      .from(doctorSpecialties)
      .leftJoin(departments, eq(doctorSpecialties.departmentId, departments.id))
      .where(where);

    const rows = await db
      .select({ specialty: doctorSpecialties, department: departments })
      .from(doctorSpecialties)
      .leftJoin(departments, eq(doctorSpecialties.departmentId, departments.id))
      .where(where)
      .orderBy(desc(doctorSpecialties.createdAt))
      .limit(perPage)
      .offset((page - 1) * perPage);

    const specialtyIds = rows.map(({ specialty }) => specialty.id);
    const doctorCounts = specialtyIds.length > 0
      ? await db
          .select({ specialtyId: doctors.specialtyId, total: count() })
          .from(doctors)
          .where(inArray(doctors.specialtyId, specialtyIds))
          .groupBy(doctors.specialtyId)
      : [];
    const doctorCountBySpecialty = new Map(
      doctorCounts.map((row) => [row.specialtyId, row.total])
    );

    const total = totalResult?.total ?? 0;

    return {
      data: rows.map(({ specialty, department }) => ({
        id: specialty.id,
        name: specialty.name,
        code: specialty.code,
        description: specialty.description,
        departmentId: specialty.departmentId,
        departmentName: department?.name ?? null,
        doctorCount: doctorCountBySpecialty.get(specialty.id) ?? 0,
        isActive: specialty.isActive,
        createdAt: specialty.createdAt!,
        updatedAt: specialty.updatedAt!,
      })),
      total,
      page,
      perPage,
      totalPages: Math.max(Math.ceil(total / perPage), 1),
    };
  },

  async get(id: string): Promise<SpecialtyRecord | null> {
    const [row] = await db
      .select({ specialty: doctorSpecialties, department: departments })
      .from(doctorSpecialties)
      .leftJoin(departments, eq(doctorSpecialties.departmentId, departments.id))
      .where(eq(doctorSpecialties.id, id))
      .limit(1);

    if (!row) return null;

    return {
      id: row.specialty.id,
      name: row.specialty.name,
      code: row.specialty.code,
      description: row.specialty.description,
      departmentId: row.specialty.departmentId,
      departmentName: row.department?.name ?? null,
      doctorCount: 0,
      isActive: row.specialty.isActive,
      createdAt: row.specialty.createdAt!,
      updatedAt: row.specialty.updatedAt!,
    };
  },

  async create(input: SpecialtyInput): Promise<SpecialtyRecord> {
    const [specialty] = await db
      .insert(doctorSpecialties)
      .values({
        name: input.name,
        code: input.code || null,
        description: input.description || null,
        departmentId: input.departmentId || null,
        isActive: input.isActive ?? true,
      })
      .returning();

    return this.get(specialty.id) as Promise<SpecialtyRecord>;
  },

  async update(id: string, input: SpecialtyInput): Promise<SpecialtyRecord | null> {
    const existing = await this.get(id);
    if (!existing) return null;

    await db
      .update(doctorSpecialties)
      .set({
        name: input.name,
        code: input.code || null,
        description: input.description || null,
        departmentId: input.departmentId || null,
        isActive: input.isActive ?? true,
      })
      .where(eq(doctorSpecialties.id, id));

    return this.get(id);
  },

  async delete(id: string): Promise<boolean> {
    const existing = await this.get(id);
    if (!existing) return false;

    await db.delete(doctorSpecialties).where(eq(doctorSpecialties.id, id));
    return true;
  },

  async toggleActive(id: string): Promise<SpecialtyRecord | null> {
    const existing = await this.get(id);
    if (!existing) return null;

    await db
      .update(doctorSpecialties)
      .set({ isActive: !existing.isActive })
      .where(eq(doctorSpecialties.id, id));

    return this.get(id);
  },

  async listByDepartment(departmentId: string): Promise<Pick<SpecialtyRecord, "id" | "name" | "code">[]> {
    const rows = await db
      .select({ id: doctorSpecialties.id, name: doctorSpecialties.name, code: doctorSpecialties.code })
      .from(doctorSpecialties)
      .where(and(eq(doctorSpecialties.departmentId, departmentId), eq(doctorSpecialties.isActive, true)))
      .orderBy(doctorSpecialties.name);

    return rows;
  },

  async listDepartments() {
    return db
      .select()
      .from(departments)
      .where(eq(departments.isActive, true))
      .orderBy(departments.name);
  },
};
