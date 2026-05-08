import { db, schema } from "@mediclinicpro/db";
import { and, eq } from "drizzle-orm";

export async function getAccessControlPageData() {
  const [roles, permissions, rolePermissions] = await Promise.all([
    getRoles(),
    getPermissions(),
    getRolePermissions(),
  ]);

  return {
    roles,
    permissions,
    rolePermissions,
  };
}

// Roles
export async function getRoles() {
  return db.query.roles.findMany({
    orderBy: (roles, { asc }) => [asc(roles.name)],
  });
}

export async function createRole(data: typeof schema.roles.$inferInsert) {
  const [role] = await db.insert(schema.roles).values(data).returning();
  return role;
}

export async function updateRole(
  id: string,
  data: Partial<typeof schema.roles.$inferInsert>
) {
  const [role] = await db
    .update(schema.roles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schema.roles.id, id))
    .returning();

  return role;
}

export async function deleteRole(id: string) {
  const [role] = await db
    .delete(schema.roles)
    .where(eq(schema.roles.id, id))
    .returning();

  return role;
}

// Permissions
export async function getPermissions() {
  return db.query.permissions.findMany({
    orderBy: (permissions, { asc }) => [
      asc(permissions.module),
      asc(permissions.action),
    ],
  });
}

export async function createPermission(
  data: typeof schema.permissions.$inferInsert
) {
  const [permission] = await db
    .insert(schema.permissions)
    .values(data)
    .returning();

  return permission;
}

export async function updatePermission(
  id: string,
  data: Partial<typeof schema.permissions.$inferInsert>
) {
  const [permission] = await db
    .update(schema.permissions)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(schema.permissions.id, id))
    .returning();

  return permission;
}

export async function deletePermission(id: string) {
  const [permission] = await db
    .delete(schema.permissions)
    .where(eq(schema.permissions.id, id))
    .returning();

  return permission;
}

// Role Has Permissions
export async function getRolePermissions() {
  return db
    .select({
      roleId: schema.roles.id,
      roleName: schema.roles.name,
      permissionId: schema.permissions.id,
      permissionName: schema.permissions.name,
      permissionAction: schema.permissions.action,
      permissionModule: schema.permissions.module,
    })
    .from(schema.roleHasPermissions)
    .innerJoin(
      schema.roles,
      eq(schema.roleHasPermissions.roleId, schema.roles.id)
    )
    .innerJoin(
      schema.permissions,
      eq(schema.roleHasPermissions.permissionId, schema.permissions.id)
    );
}

export async function assignPermissionToRole(
  roleId: string,
  permissionId: string
) {
  const [result] = await db
    .insert(schema.roleHasPermissions)
    .values({
      roleId,
      permissionId,
    })
    .onConflictDoNothing()
    .returning();

  return result;
}

export async function removePermissionFromRole(
  roleId: string,
  permissionId: string
) {
  const [result] = await db
    .delete(schema.roleHasPermissions)
    .where(
      and(
        eq(schema.roleHasPermissions.roleId, roleId),
        eq(schema.roleHasPermissions.permissionId, permissionId)
      )
    )
    .returning();

  return result;
}