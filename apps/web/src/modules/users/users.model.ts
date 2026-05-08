import { db, schema } from "@mediclinicpro/db";
import type { Role } from "@mediclinicpro/types";
import { eq } from "drizzle-orm";
import type { ProfileUpdateInput, UserListItem } from "./users.types";

function mapRole(roleName: string | null): UserListItem["role"] {
  return roleName === "admin" || roleName === "doctor" || roleName === "receptionist"
    ? (roleName as Role)
    : "user";
}

export async function findUsers(): Promise<UserListItem[]> {
  const rows = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      roleName: schema.roles.name,
      createdAt: schema.users.createdAt,
    })
    .from(schema.users)
    .leftJoin(schema.roles, eq(schema.users.roleId, schema.roles.id));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: mapRole(row.roleName),
    createdAt: row.createdAt,
  }));
}

export async function updateUserProfile(userId: string, input: ProfileUpdateInput) {
  await db
    .update(schema.users)
    .set({
      name: input.name,
      email: input.email.toLowerCase(),
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, userId));
}
