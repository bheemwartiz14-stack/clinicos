import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const permissions = pgTable(
  "permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    module: varchar("module", { length: 100 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("permissions_name_unique").on(table.name),
    uniqueIndex("permissions_module_action_unique").on(table.module, table.action),
    index("permissions_module_idx").on(table.module),
    index("permissions_action_idx").on(table.action),
    index("permissions_is_active_idx").on(table.isActive),
  ],
);