import {
    pgTable,
    uuid,
    varchar,
    text,
    boolean,
    timestamp,
    pgEnum,
    uniqueIndex,
} from "drizzle-orm/pg-core";


export const userStatusEnum = pgEnum("user_status", [
    "active",
    "inactive",
    "blocked",
]);
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }),
    username: varchar("username", { length: 100 }),
    roleId: uuid("role_id").references(() => roles.id, { onDelete: "cascade" }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phone: varchar("phone", { length: 30 }),
    passwordHash: text("password_hash").notNull(),
    avatar: text("avatar"),
    status: userStatusEnum("status").default("active").notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
});


export const roles = pgTable("roles", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    code: varchar("code", { length: 100 }).notNull().unique(),
    description: text("description"),
    isSystem: boolean("is_system").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const permissions = pgTable("permissions", {
    id: uuid("id").primaryKey().defaultRandom(),
    module: varchar("module", { length: 100 }).notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    code: varchar("code", { length: 150 }).notNull().unique(),
    description: text("description"),
});
export const rolePermissions = pgTable(
    "role_permissions",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        roleId: uuid("role_id")
            .references(() => roles.id, { onDelete: "cascade" })
            .notNull(),
        permissionId: uuid("permission_id")
            .references(() => permissions.id, { onDelete: "cascade" })
            .notNull(),
    },
    (table) => [
        uniqueIndex("role_permissions_unique_idx").on(
            table.roleId,
            table.permissionId
        ),
    ]
);
export const userSessions = pgTable("user_sessions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    tokenHash: text("token_hash").notNull(),
    ipAddress: varchar("ip_address", { length: 100 }),
    userAgent: text("user_agent"),
    isActive: boolean("is_active").default(true).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});


export const passwordResetTokens = pgTable("password_reset_tokens", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    tokenHash: text("token_hash").notNull(),
    isUsed: boolean("is_used").default(false).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
