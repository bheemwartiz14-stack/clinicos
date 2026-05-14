import { db, schema } from "@mediclinicpro/db";
import { roles as appRoles, type Role } from "@mediclinicpro/types";
import { and, eq, gt } from "drizzle-orm";

type UserWithRoleRow = {
  id: string;
  name: string;
  email: string;
  password: string;
  roleId: string | null;
  roleName: string | null;
};

function toAppRole(roleName: string | null): Role {
  return appRoles.includes(roleName as Role) ? (roleName as Role) : "user";
}

async function findPermissionsByRoleId(roleId: string | null) {
  if (!roleId) {
    return [];
  }

  const rows = await db
    .select({ name: schema.permissions.name })
    .from(schema.roleHasPermissions)
    .innerJoin(
      schema.permissions,
      eq(schema.roleHasPermissions.permissionId, schema.permissions.id),
    )
    .where(
      and(eq(schema.roleHasPermissions.roleId, roleId), eq(schema.permissions.isActive, true)),
    );

  return rows.map((row) => row.name);
}

async function mapUser(row: UserWithRoleRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password,
    roleId: row.roleId,
    role: toAppRole(row.roleName),
    permissions: await findPermissionsByRoleId(row.roleId),
  };
}

export async function findUserByUsername(username: string) {
  const [row] = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      password: schema.users.password,
      roleId: schema.users.roleId,
      roleName: schema.roles.name,
    })
    .from(schema.users)
    .leftJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
    .where(eq(schema.users.username, username))
    .limit(1);

  return row ? mapUser(row) : null;
}

export async function findUserById(id: string) {
  const [row] = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      password: schema.users.password,
      roleId: schema.users.roleId,
      roleName: schema.roles.name,
    })
    .from(schema.users)
    .leftJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
    .where(eq(schema.users.id, id))
    .limit(1);

  return row ? mapUser(row) : null;
}

export async function createSessionRecord(input: {
  token: string;
  userId: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const [session] = await db.insert(schema.sessions).values(input).returning();

  return session;
}

export async function findValidSessionByToken(token: string) {
  const [session] = await db
    .select()
    .from(schema.sessions)
    .where(and(eq(schema.sessions.token, token), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);

  return session ?? null;
}

export async function deleteSessionByToken(token: string) {
  await db.delete(schema.sessions).where(eq(schema.sessions.token, token));
}
