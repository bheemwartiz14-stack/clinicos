import { db, schema } from "@mediclinicpro/db";
import { asc, count, desc, eq, ilike, or } from "drizzle-orm";
import type {
  CreateUserInput,
  DepartmentOption,
  RoleOption,
  UpdateUserInput,
  UserListItem,
} from "./users.types";

type FindUsersOptions = {
  query?: string;
  page?: number;
  pageSize?: number;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  roleId: string | null;
  roleName: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  specialization: string | null;
  qualification: string | null;
  experienceYears: number | null;
  consultationFee: string | null;
  licenseNumber: string | null;
  department: string | null;
  bio: string | null;
  employeeCode: string | null;
  shift: string | null;
  deskNumber: string | null;
  joiningDate: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function formatRoleLabel(name: string) {
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function mapRole(row: typeof schema.roles.$inferSelect): RoleOption {
  return {
    id: row.id,
    name: row.name,
    label: formatRoleLabel(row.name),
  };
}

function mapUser(row: UserRow): UserListItem {
  return {
    id: row.id,

    name: row.name,

    email: row.email,
    emailVerified: row.emailVerified,
    image: row.image,
    roleId: row.roleId,
    roleName: row.roleName,
    isProtectedSuperAdmin: isProtectedSuperAdmin(row),
    firstName: row.firstName,
    lastName: row.lastName,
    phone: row.phone,
    gender: row.gender,
    dateOfBirth: row.dateOfBirth,
    avatarUrl: row.avatarUrl,
    address: row.address,
    city: row.city,
    state: row.state,
    country: row.country,
    postalCode: row.postalCode,
    specialization: row.specialization,
    qualification: row.qualification,
    experienceYears: row.experienceYears,
    consultationFee: row.consultationFee,
    licenseNumber: row.licenseNumber,
    department: row.department,
    bio: row.bio,
    employeeCode: row.employeeCode,
    shift: row.shift,
    deskNumber: row.deskNumber,
    joiningDate: row.joiningDate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function isProtectedSuperAdmin(row: Pick<UserRow, "email" | "name" | "roleName">) {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase() ?? "admin@example.com";
  return (
    row.roleName === "admin" &&
    (row.name.trim().toLowerCase() === "super admin" || row.email.toLowerCase() === adminEmail)
  );
}

function buildUserSearch(query?: string) {
  const normalizedQuery = query?.trim();

  if (!normalizedQuery) {
    return undefined;
  }

  const search = `%${normalizedQuery}%`;

  return or(
    ilike(schema.users.name, search),
    ilike(schema.users.email, search),
    ilike(schema.roles.name, search),
    ilike(schema.userProfiles.firstName, search),
    ilike(schema.userProfiles.lastName, search),
    ilike(schema.userProfiles.phone, search),
  );
}

function getUserSelection() {
  return {
    id: schema.users.id,
    name: schema.users.name,
    email: schema.users.email,
    emailVerified: schema.users.emailVerified,
    image: schema.users.image,
    roleId: schema.users.roleId,
    roleName: schema.roles.name,
    firstName: schema.userProfiles.firstName,
    lastName: schema.userProfiles.lastName,
    phone: schema.userProfiles.phone,
    gender: schema.userProfiles.gender,
    dateOfBirth: schema.userProfiles.dateOfBirth,
    avatarUrl: schema.userProfiles.avatarUrl,
    address: schema.userProfiles.address,
    city: schema.userProfiles.city,
    state: schema.userProfiles.state,
    country: schema.userProfiles.country,
    postalCode: schema.userProfiles.postalCode,
    specialization: schema.doctors.specialization,
    qualification: schema.doctors.qualification,
    experienceYears: schema.doctors.experienceYears,
    consultationFee: schema.doctors.consultationFee,
    licenseNumber: schema.doctors.licenseNumber,
    department: schema.departments.name,
    bio: schema.doctors.bio,
    employeeCode: schema.receptionists.employeeCode,
    shift: schema.receptionists.shift,
    deskNumber: schema.receptionists.deskNumber,
    joiningDate: schema.receptionists.joiningDate,
    createdAt: schema.users.createdAt,
    updatedAt: schema.users.updatedAt,
  };
}

export async function findUsers({
  page = 1,
  pageSize = 10,
  query,
}: FindUsersOptions = {}): Promise<UserListItem[]> {
  const rows = await db
    .select(getUserSelection())
    .from(schema.users)
    .leftJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
    .leftJoin(schema.userProfiles, eq(schema.users.id, schema.userProfiles.userId))
    .leftJoin(schema.doctors, eq(schema.users.id, schema.doctors.userId))
    .leftJoin(schema.departments, eq(schema.doctors.departmentId, schema.departments.id))
    .leftJoin(schema.receptionists, eq(schema.users.id, schema.receptionists.userId))
    .where(buildUserSearch(query))
    .orderBy(desc(schema.users.updatedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return rows.map(mapUser);
}

export async function countUsers(query?: string) {
  const [result] = await db
    .select({ value: count() })
    .from(schema.users)
    .leftJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
    .leftJoin(schema.userProfiles, eq(schema.users.id, schema.userProfiles.userId))
    .where(buildUserSearch(query));

  return Number(result?.value ?? 0);
}

export async function countVerifiedUsers() {
  const [result] = await db
    .select({ value: count() })
    .from(schema.users)
    .where(eq(schema.users.emailVerified, true));

  return Number(result?.value ?? 0);
}

export async function countUsersWithRoles() {
  const [result] = await db.select({ value: count(schema.users.roleId) }).from(schema.users);

  return Number(result?.value ?? 0);
}

export async function findRoleOptions(): Promise<RoleOption[]> {
  const roles = await db
    .select()
    .from(schema.roles)
    .where(eq(schema.roles.isActive, true))
    .orderBy(asc(schema.roles.name));

  return roles.map(mapRole);
}

export async function findDepartmentOptions(): Promise<DepartmentOption[]> {
  const departments = await db
    .select({
      id: schema.departments.id,
      name: schema.departments.name,
      code: schema.departments.code,
    })
    .from(schema.departments)
    .where(eq(schema.departments.isActive, true))
    .orderBy(asc(schema.departments.name));

  return departments;
}

export async function findUserProtection(id: string) {
  const [user] = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      roleName: schema.roles.name,
    })
    .from(schema.users)
    .leftJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
    .where(eq(schema.users.id, id))
    .limit(1);

  if (!user) {
    return null;
  }

  return {
    ...user,
    isProtectedSuperAdmin: isProtectedSuperAdmin(user),
  };
}

function getUserValues(input: CreateUserInput | UpdateUserInput, password: string) {
  return {
    name: input.name,
    username: input.name,
    email: input.email.toLowerCase(),
    emailVerified: input.emailVerified,
    password,
    image: input.image ?? null,
    roleId: input.roleId ?? null,
  };
}

function getProfileValues(userId: string, input: CreateUserInput | UpdateUserInput) {
  return {
    userId,
    firstName: input.firstName ?? null,
    lastName: input.lastName ?? null,
    phone: input.phone ?? null,
    gender: input.gender ?? null,
    dateOfBirth: input.dateOfBirth ?? null,
    avatarUrl: input.avatarUrl ?? null,
    address: input.address ?? null,
    city: input.city ?? null,
    state: input.state ?? null,
    country: input.country ?? null,
    postalCode: input.postalCode ?? null,
  };
}

function getDoctorValues(
  userId: string,
  input: CreateUserInput | UpdateUserInput,
  departmentId: string | null,
) {
  return {
    userId,
    departmentId,
    specialization: input.specialization ?? null,
    qualification: input.qualification ?? null,
    experienceYears: input.experienceYears ?? null,
    consultationFee: input.consultationFee ?? null,
    licenseNumber: input.licenseNumber ?? null,
    bio: input.bio ?? null,
    isAvailable: true,
  };
}

function getReceptionistValues(userId: string, input: CreateUserInput | UpdateUserInput) {
  return {
    userId,
    employeeCode: input.employeeCode ?? null,
    shift: input.shift ?? null,
    deskNumber: input.deskNumber ?? null,
    joiningDate: input.joiningDate ?? null,
    isActive: true,
  };
}

async function findRoleName(roleId: string | undefined | null) {
  if (!roleId) {
    return null;
  }

  const [role] = await db
    .select({ name: schema.roles.name })
    .from(schema.roles)
    .where(eq(schema.roles.id, roleId))
    .limit(1);

  return role?.name ?? null;
}

async function findDepartmentId(departmentName: string | undefined | null) {
  if (!departmentName) {
    return null;
  }

  const [department] = await db
    .select({ id: schema.departments.id })
    .from(schema.departments)
    .where(eq(schema.departments.name, departmentName))
    .limit(1);

  return department?.id ?? null;
}

async function upsertRoleDetails(
  userId: string,
  roleName: string | null | undefined,
  input: CreateUserInput | UpdateUserInput,
) {
  if (roleName === "doctor") {
    const [doctor] = await db
      .select({ id: schema.doctors.id })
      .from(schema.doctors)
      .where(eq(schema.doctors.userId, userId))
      .limit(1);
    const values = getDoctorValues(userId, input, await findDepartmentId(input.department));

    if (doctor) {
      await db
        .update(schema.doctors)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(schema.doctors.id, doctor.id));
    } else {
      await db.insert(schema.doctors).values(values);
    }
  }

  if (roleName === "receptionist") {
    const [receptionist] = await db
      .select({ id: schema.receptionists.id })
      .from(schema.receptionists)
      .where(eq(schema.receptionists.userId, userId))
      .limit(1);
    const values = getReceptionistValues(userId, input);

    if (receptionist) {
      await db
        .update(schema.receptionists)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(schema.receptionists.id, receptionist.id));
    } else {
      await db.insert(schema.receptionists).values(values);
    }
  }
}

export async function createUser(input: CreateUserInput, passwordHash: string) {
  const [user] = await db
    .insert(schema.users)
    .values(getUserValues(input, passwordHash))
    .returning();

  if (!user) {
    return null;
  }

  await db.insert(schema.userProfiles).values(getProfileValues(user.id, input));
  await upsertRoleDetails(user.id, input.roleName ?? (await findRoleName(input.roleId)), input);

  return user;
}

export async function updateUser(input: UpdateUserInput, passwordHash?: string) {
  const userValues = {
    name: input.name,
    email: input.email.toLowerCase(),
    emailVerified: input.emailVerified,
    image: input.image ?? null,
    roleId: input.roleId ?? null,
    ...(passwordHash ? { password: passwordHash } : {}),
    updatedAt: new Date(),
  };

  const [user] = await db
    .update(schema.users)
    .set(userValues)
    .where(eq(schema.users.id, input.id))
    .returning();

  if (!user) {
    return null;
  }

  const [profile] = await db
    .select({ id: schema.userProfiles.id })
    .from(schema.userProfiles)
    .where(eq(schema.userProfiles.userId, input.id))
    .limit(1);

  const profileValues = getProfileValues(input.id, input);

  if (profile) {
    await db
      .update(schema.userProfiles)
      .set({ ...profileValues, updatedAt: new Date() })
      .where(eq(schema.userProfiles.id, profile.id));
  } else {
    await db.insert(schema.userProfiles).values(profileValues);
  }

  await upsertRoleDetails(input.id, input.roleName ?? (await findRoleName(input.roleId)), input);

  return user;
}

export async function deleteUser(id: string) {
  const user = await findUserProtection(id);

  if (!user) {
    return null;
  }

  if (user.isProtectedSuperAdmin) {
    return user;
  }

  await db.delete(schema.users).where(eq(schema.users.id, id));

  return user;
}
