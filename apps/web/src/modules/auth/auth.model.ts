import { db, schema } from "@mediclinicpro/db";
import { roles as appRoles, type Role } from "@mediclinicpro/types";
import { eq } from "drizzle-orm";

type UserWithRoleRow = {
  id: string;
  name: string;
  email: string;
  password: string;
  roleName: string | null;
};

function toAppRole(roleName: string | null): Role {
  return appRoles.includes(roleName as Role) ? (roleName as Role) : "receptionist";
}

function mapUser(row: UserWithRoleRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password,
    role: toAppRole(row.roleName),
  };
}

export async function findUserByEmail(email: string) {
  const [row] = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      password: schema.users.password,
      roleName: schema.roles.name,
    })
    .from(schema.users)
    .leftJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
    .where(eq(schema.users.email, email))
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
      roleName: schema.roles.name,
    })
    .from(schema.users)
    .leftJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
    .where(eq(schema.users.id, id))
    .limit(1);

  return row ? mapUser(row) : null;
}
