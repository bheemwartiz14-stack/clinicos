import { db, schema } from "@mediclinicpro/db";
import { asc, count, countDistinct, desc, eq, ilike, or } from "drizzle-orm";
import type {
  CreateDoctorInput,
  DoctorBranchOption,
  DoctorDepartmentOption,
  DoctorListItem,
} from "./doctors.types";

type FindDoctorsOptions = {
  query?: string;
  limit?: number;
};

function mapDoctor(row: {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  specialization: string | null;
  qualification: string | null;
  experienceYears: number | null;
  consultationFee: string | null;
  licenseNumber: string | null;
  department: string | null;
  branchId: string | null;
  branchName: string | null;
  branchCode: string | null;
  bio: string | null;
  isAvailable: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}): DoctorListItem {
  return row;
}

function buildDoctorSearch(query?: string) {
  const normalizedQuery = query?.trim();

  if (!normalizedQuery) {
    return undefined;
  }

  const search = `%${normalizedQuery}%`;

  return or(
    ilike(schema.users.name, search),
    ilike(schema.users.email, search),
    ilike(schema.doctors.specialization, search),
    ilike(schema.doctors.qualification, search),
    ilike(schema.departments.name, search),
    ilike(schema.departments.code, search),
    ilike(schema.branches.name, search),
    ilike(schema.branches.code, search),
    ilike(schema.doctors.licenseNumber, search),
  );
}

function doctorSelection() {
  return {
    id: schema.doctors.id,
    userId: schema.doctors.userId,
    name: schema.users.name,
    email: schema.users.email,
    image: schema.users.image,
    specialization: schema.doctors.specialization,
    qualification: schema.doctors.qualification,
    experienceYears: schema.doctors.experienceYears,
    consultationFee: schema.doctors.consultationFee,
    licenseNumber: schema.doctors.licenseNumber,
    department: schema.departments.name,
    branchId: schema.doctors.branchId,
    branchName: schema.branches.name,
    branchCode: schema.branches.code,
    bio: schema.doctors.bio,
    isAvailable: schema.doctors.isAvailable,
    createdAt: schema.doctors.createdAt,
    updatedAt: schema.doctors.updatedAt,
  };
}

export async function findDoctors({
  limit = 50,
  query,
}: FindDoctorsOptions = {}): Promise<DoctorListItem[]> {
  const rows = await db
    .select(doctorSelection())
    .from(schema.doctors)
    .innerJoin(schema.users, eq(schema.doctors.userId, schema.users.id))
    .leftJoin(schema.departments, eq(schema.doctors.departmentId, schema.departments.id))
    .leftJoin(schema.branches, eq(schema.doctors.branchId, schema.branches.id))
    .where(buildDoctorSearch(query))
    .orderBy(desc(schema.doctors.updatedAt), asc(schema.users.name))
    .limit(limit);

  return rows.map(mapDoctor);
}

export async function countDoctors(query?: string) {
  const [result] = await db
    .select({ value: count() })
    .from(schema.doctors)
    .innerJoin(schema.users, eq(schema.doctors.userId, schema.users.id))
    .leftJoin(schema.departments, eq(schema.doctors.departmentId, schema.departments.id))
    .leftJoin(schema.branches, eq(schema.doctors.branchId, schema.branches.id))
    .where(buildDoctorSearch(query));

  return Number(result?.value ?? 0);
}

export async function countAvailableDoctors() {
  const [result] = await db
    .select({ value: count() })
    .from(schema.doctors)
    .where(eq(schema.doctors.isAvailable, true));

  return Number(result?.value ?? 0);
}

export async function countDoctorDepartments() {
  const [result] = await db
    .select({ value: countDistinct(schema.doctors.departmentId) })
    .from(schema.doctors);

  return Number(result?.value ?? 0);
}

export async function findDoctorDepartmentOptions(): Promise<DoctorDepartmentOption[]> {
  return db
    .select({
      id: schema.departments.id,
      name: schema.departments.name,
      code: schema.departments.code,
    })
    .from(schema.departments)
    .where(eq(schema.departments.isActive, true))
    .orderBy(asc(schema.departments.name));
}

export async function findDoctorBranchOptions(): Promise<DoctorBranchOption[]> {
  return db
    .select({
      id: schema.branches.id,
      name: schema.branches.name,
      code: schema.branches.code,
    })
    .from(schema.branches)
    .where(eq(schema.branches.isActive, true))
    .orderBy(asc(schema.branches.name));
}

export async function findDoctorRoleId() {
  const [role] = await db
    .select({ id: schema.roles.id })
    .from(schema.roles)
    .where(eq(schema.roles.name, "doctor"))
    .limit(1);

  return role?.id ?? null;
}

export async function createDoctor(input: CreateDoctorInput, passwordHash: string, roleId: string) {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(schema.users)
      .values({
        name: input.name,
        email: input.email.toLowerCase(),
        emailVerified: input.emailVerified,
        password: passwordHash,
        image: input.image ?? null,
        roleId,
      })
      .returning({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
      });

    if (!user) {
      return null;
    }

    await tx.insert(schema.userProfiles).values({
      userId: user.id,
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
      phone: input.phone ?? null,
      gender: input.gender ?? null,
      dateOfBirth: input.dateOfBirth ?? null,
      address: input.address ?? null,
      city: input.city ?? null,
      state: input.state ?? null,
      country: input.country ?? null,
      postalCode: input.postalCode ?? null,
    });

    const [doctor] = await tx
      .insert(schema.doctors)
      .values({
        userId: user.id,
        departmentId: input.departmentId,
        branchId: input.branchId ?? null,
        specialization: input.specialization,
        qualification: input.qualification ?? null,
        experienceYears: input.experienceYears ?? null,
        consultationFee: input.consultationFee ?? null,
        licenseNumber: input.licenseNumber ?? null,
        bio: input.bio ?? null,
        isAvailable: input.isAvailable,
      })
      .returning({ id: schema.doctors.id });

    if (!doctor) {
      return null;
    }

    return {
      id: doctor.id,
      userId: user.id,
      name: user.name,
      email: user.email,
    };
  });
}
