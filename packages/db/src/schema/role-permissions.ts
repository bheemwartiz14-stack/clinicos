
import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { permissions } from "./permissions";
import { roles } from "./roles";
export const roleHasPermissions = pgTable(
  "role_has_permissions",
  {
    roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.roleId, t.permissionId] }),
    index("idx_role_permissions_role_id").on(t.roleId),
    index("idx_role_permissions_permission_id").on(t.permissionId),
  ],
);

// ✅ Relations
export const roleHasPermissionsRelations = relations(
  roleHasPermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [roleHasPermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [roleHasPermissions.permissionId],
      references: [permissions.id],
    }),
  }),
);

// ✅ Types
export type RolePermissionEntity = typeof roleHasPermissions.$inferSelect;

export type NewRolePermissionEntity = typeof roleHasPermissions.$inferInsert;
