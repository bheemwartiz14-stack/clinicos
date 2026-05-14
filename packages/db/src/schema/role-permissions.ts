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
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),

    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      name: "role_has_permissions_pk",
      columns: [table.roleId, table.permissionId],
    }),
  ],
);

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

export type RolePermissionEntity =
  typeof roleHasPermissions.$inferSelect;

export type NewRolePermissionEntity =
  typeof roleHasPermissions.$inferInsert;