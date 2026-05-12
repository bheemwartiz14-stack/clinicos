import { boolean, date, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const receptionists = pgTable("receptionists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  employeeCode: varchar("employee_code", { length: 50 }),
  shift: varchar("shift", { length: 50 }),
  deskNumber: varchar("desk_number", { length: 50 }),
  joiningDate: date("joining_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
