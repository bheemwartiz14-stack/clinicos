import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./auth";
import { branches } from "./branches";
import { departments } from "./departments";

export const doctors = pgTable(
  "doctors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    departmentId: uuid("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    branchId: uuid("branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),
    specialization: varchar("specialization", { length: 150 }),
    qualification: varchar("qualification", { length: 150 }),
    experienceYears: integer("experience_years"),
    consultationFee: numeric("consultation_fee", { precision: 10, scale: 2 }),
    licenseNumber: varchar("license_number", { length: 100 }),
    bio: text("bio"),
    isAvailable: boolean("is_available").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("doctors_user_id_idx").on(table.userId),
    index("doctors_department_id_idx").on(table.departmentId),
    index("doctors_branch_id_idx").on(table.branchId),
    index("doctors_specialization_idx").on(table.specialization),
    index("doctors_is_available_idx").on(table.isAvailable),
  ],
);