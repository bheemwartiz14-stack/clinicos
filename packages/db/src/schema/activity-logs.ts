import { index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    version: integer("version").notNull().default(1),

    action: varchar("action", { length: 120 }).notNull(),
    module: varchar("module", { length: 120 }).notNull(),
    description: text("description"),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    userName: varchar("user_name", { length: 255 }),
    ipAddress: varchar("ip_address", { length: 120 }),
    metadata: text("metadata"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("activity_logs_action_idx").on(table.action),
    index("activity_logs_module_idx").on(table.module),
    index("activity_logs_user_id_idx").on(table.userId),
    index("activity_logs_created_at_idx").on(table.createdAt),
  ],
);
