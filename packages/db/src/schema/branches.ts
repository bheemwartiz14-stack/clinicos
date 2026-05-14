import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

export const branches = pgTable(
  "branches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 180 }).notNull(),
    code: varchar("code", { length: 60 }).notNull().unique(),
    type: varchar("type", { length: 80 }).notNull().default("clinic"),
    supportEmail: varchar("support_email", { length: 255 }),
    supportPhone: varchar("support_phone", { length: 50 }),
    managerId: uuid("manager_id").references(() => users.id, { onDelete: "set null" }),
    address: jsonb("address").$type<{
      addressLine1?: string;
      addressLine2?: string;
      country?: string;
      state?: string;
      city?: string;
      postalCode?: string;
    }>(),
    notes: text("notes"),
    isMain: boolean("is_main").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("branches_name_idx").on(table.name),
    index("branches_code_idx").on(table.code),
    index("branches_manager_idx").on(table.managerId),
    index("branches_is_active_idx").on(table.isActive),
  ],
);