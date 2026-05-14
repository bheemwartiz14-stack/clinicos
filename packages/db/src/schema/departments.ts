import { boolean, index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const departments = pgTable(
  "departments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 150 }).notNull().unique(),
    code: varchar("code", { length: 50 }).unique(),
    departmentHeadId: uuid("department_head_id").references(() => users.id, {
      onDelete: "set null",
    }),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("departments_name_idx").on(table.name),
    index("departments_code_idx").on(table.code),
    index("departments_head_idx").on(table.departmentHeadId),
    index("departments_is_active_idx").on(table.isActive),
  ],
);