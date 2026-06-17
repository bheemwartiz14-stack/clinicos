import { db, users, roles } from "@mediclinic/db";
import {
  eq,
  ilike,
  or,
  and,
  desc,
  asc,
  count,
  sql,
  type SQL,
} from "drizzle-orm";
import type { UserRow, UserListOptions } from "./users.types";

const USER_COLUMNS = {
  id: users.id,
  firstName: users.firstName,
  lastName: users.lastName,
  username: users.username,
  roleId: users.roleId,
  email: users.email,
  phone: users.phone,
  passwordHash: users.passwordHash,
  avatar: users.avatar,
  status: users.status,
  emailVerified: users.emailVerified,
  lastLoginAt: users.lastLoginAt,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
} as const;

function buildWhereClause(options: UserListOptions) {
  const clauses: SQL[] = [];

  if (options.filters?.roleId) {
    clauses.push(eq(users.roleId, options.filters.roleId));
  }
  if (options.filters?.status) {
    clauses.push(eq(users.status, options.filters.status));
  }
  if (options.filters?.emailVerified !== undefined) {
    clauses.push(eq(users.emailVerified, options.filters.emailVerified));
  }
  if (options.filters?.search) {
    const term = `%${options.filters.search}%`;
    clauses.push(
      or(
        ilike(users.firstName, term),
        ilike(users.lastName, term),
        ilike(users.email, term),
        ilike(users.username, term),
      ),
    );
  }

  return clauses.length > 0 ? and(...clauses) : undefined;
}

function buildOrderBy(options: UserListOptions) {
  const order = options.sortOrder === "asc" ? asc : desc;

  switch (options.sortBy) {
    case "firstName":
      return order(users.firstName);
    case "email":
      return order(users.email);
    case "status":
      return order(users.status);
    default:
      return order(users.createdAt);
  }
}

export const userRepository = {
  async create(input: Partial<UserRow>): Promise<UserRow> {
    const [row] = await db
      .insert(users)
      .values(input)
      .returning(USER_COLUMNS);

    return row;
  },

  async findById(id: string): Promise<UserRow | undefined> {
    const [row] = await db
      .select(USER_COLUMNS)
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return row;
  },

  async findByEmail(email: string): Promise<UserRow | undefined> {
    const [row] = await db
      .select(USER_COLUMNS)
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    return row;
  },

  async findByUsername(username: string): Promise<UserRow | undefined> {
    const [row] = await db
      .select(USER_COLUMNS)
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return row;
  },

  async findMany(options: UserListOptions): Promise<{ data: UserRow[]; total: number }> {
    const where = buildWhereClause(options);

    const [totalResult] = await db
      .select({ count: count() })
      .from(users)
      .where(where);

    const data = await db
      .select(USER_COLUMNS)
      .from(users)
      .where(where)
      .orderBy(buildOrderBy(options))
      .limit(options.limit)
      .offset((options.page - 1) * options.limit);

    return { data, total: totalResult?.count ?? 0 };
  },

  async count(filters?: { roleId?: string; status?: string }): Promise<number> {
    const clauses: SQL[] = [];

    if (filters?.roleId) clauses.push(eq(users.roleId, filters.roleId));
    if (filters?.status) clauses.push(eq(users.status, filters.status));

    const where = clauses.length > 0 ? and(...clauses) : undefined;

    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(where);

    return result?.count ?? 0;
  },

  async update(id: string, input: Partial<UserRow>): Promise<UserRow | undefined> {
    const [row] = await db
      .update(users)
      .set(input)
      .where(eq(users.id, id))
      .returning(USER_COLUMNS);

    return row;
  },

  async delete(id: string): Promise<void> {
    await db
      .delete(users)
      .where(eq(users.id, id));
  },

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, id));
  },

  async updateStatus(id: string, status: "active" | "inactive" | "blocked"): Promise<void> {
    await db
      .update(users)
      .set({ status })
      .where(eq(users.id, id));
  },

  async verifyEmail(id: string): Promise<void> {
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, id));
  },

  async updateLastLogin(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: sql`NOW()` })
      .where(eq(users.id, id));
  },

  async findByIdWithRole(id: string): Promise<{
    user: UserRow;
    roleName: string | null;
    roleCode: string | null;
  } | undefined> {
    const [row] = await db
      .select({
        user: USER_COLUMNS,
        roleName: roles.name,
        roleCode: roles.code,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, id))
      .limit(1);

    if (!row) return undefined;

    return {
      user: row.user,
      roleName: row.roleName,
      roleCode: row.roleCode,
    };
  },
};
