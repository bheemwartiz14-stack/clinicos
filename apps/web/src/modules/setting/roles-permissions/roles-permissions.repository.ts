import { db, schema } from "@mediclinicpro/db";
import { asc, count } from "drizzle-orm";
import type { RoleCardItem, RolePermissionItem } from "./roles-permissions.types";
import type { CreateRoleInput } from "./roles-permissions.validation";

const defaultRoleNames = new Set(["admin", "doctor", "receptionist", "user"]);

function formatRoleLabel(name: string) {
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function mapPermission(row: typeof schema.permissions.$inferSelect): RolePermissionItem {
  return {
    id: row.id,
    name: row.name,
    action: row.action,
    module: row.module,
    description: row.description,
    isActive: row.isActive,
  };
}

export async function findAllPermissions() {
  const permissions = await db
    .select()
    .from(schema.permissions)
    .orderBy(asc(schema.permissions.module), asc(schema.permissions.action));

  return permissions.map(mapPermission);
}

export async function findRolesWithPermissions(): Promise<RoleCardItem[]> {
  const [roles, permissions, rolePermissions, userCounts] = await Promise.all([
    db.select().from(schema.roles).orderBy(asc(schema.roles.name)),
    findAllPermissions(),
    db.select().from(schema.roleHasPermissions),
    db
      .select({
        roleId: schema.users.roleId,
        value: count(),
      })
      .from(schema.users)
      .groupBy(schema.users.roleId),
  ]);

  const permissionsById = new Map(permissions.map((permission) => [permission.id, permission]));
  const userCountByRoleId = new Map(
    userCounts.filter((row) => row.roleId).map((row) => [row.roleId as string, Number(row.value)]),
  );
  const rolePermissionIds = rolePermissions.reduce<Map<string, string[]>>((acc, row) => {
    const permissionIds = acc.get(row.roleId) ?? [];
    permissionIds.push(row.permissionId);
    acc.set(row.roleId, permissionIds);
    return acc;
  }, new Map());

  return roles.map((role) => {
    const assignedPermissions = (rolePermissionIds.get(role.id) ?? [])
      .map((permissionId) => permissionsById.get(permissionId))
      .filter((permission): permission is RolePermissionItem => Boolean(permission));

    return {
      id: role.id,
      name: role.name,
      label: formatRoleLabel(role.name),
      description: role.description,
      isActive: role.isActive,
      isDefault: defaultRoleNames.has(role.name),
      isFullAccess: permissions.length > 0 && assignedPermissions.length === permissions.length,
      userCount: userCountByRoleId.get(role.id) ?? 0,
      permissions: assignedPermissions,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  });
}

export async function countAssignedRolePermissions() {
  const [result] = await db.select({ value: count() }).from(schema.roleHasPermissions);

  return Number(result?.value ?? 0);
}

export async function createRole(input: CreateRoleInput) {
  const [role] = await db
    .insert(schema.roles)
    .values({
      description: input.description ?? null,
      isActive: input.isActive,
      name: input.name,
    })
    .returning();

  if (!role) {
    return null;
  }

  if (input.permissionIds.length > 0) {
    await db
      .insert(schema.roleHasPermissions)
      .values(
        input.permissionIds.map((permissionId) => ({
          permissionId,
          roleId: role.id,
        })),
      )
      .onConflictDoNothing();
  }

  return role;
}
