import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "doctor", "receptionist"]);
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "checked_in",
  "completed",
  "cancelled",
]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["draft", "unpaid", "paid", "void"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: roleEnum("role").default("receptionist").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  }),
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 120 }).notNull(),
    label: varchar("label", { length: 160 }).notNull(),
    description: text("description"),
    ...timestamps,
  },
  (table) => ({
    keyIdx: uniqueIndex("role_permissions_key_idx").on(table.key),
  }),
);

export const roleHasPermissions = pgTable(
  "role_has_permissions",
  {
    role: roleEnum("role").notNull(),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => rolePermissions.id, { onDelete: "cascade" }),
    hasPermission: boolean("has_permission").default(false).notNull(),
    ...timestamps,
  },
  (table) => ({
    pk: primaryKey({ columns: [table.role, table.permissionId] }),
    permissionIdx: index("role_has_permissions_permission_idx").on(table.permissionId),
  }),
);

export const patients = pgTable(
  "patients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 40 }).notNull(),
    dateOfBirth: date("date_of_birth").notNull(),
    gender: varchar("gender", { length: 20 }).default("unknown").notNull(),
    bloodGroup: varchar("blood_group", { length: 8 }),
    address: text("address"),
    allergies: text("allergies"),
    medicalHistory: text("medical_history"),
    version: integer("version").default(0).notNull(),
    ...timestamps,
  },
  (table) => ({
    searchIdx: index("patients_search_idx").on(table.firstName, table.lastName, table.phone),
  }),
);

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    doctorId: uuid("doctor_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    status: appointmentStatusEnum("status").default("scheduled").notNull(),
    reason: text("reason").notNull(),
    notes: text("notes"),
    version: integer("version").default(0).notNull(),
    ...timestamps,
  },
  (table) => ({
    scheduleIdx: index("appointments_schedule_idx").on(table.doctorId, table.startsAt),
  }),
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    appointmentId: uuid("appointment_id").references(() => appointments.id, {
      onDelete: "set null",
    }),
    invoiceNumber: varchar("invoice_number", { length: 60 }).notNull(),
    status: invoiceStatusEnum("status").default("unpaid").notNull(),
    items: jsonb("items")
      .$type<Array<{ description: string; quantity: number; unitPrice: number }>>()
      .default([])
      .notNull(),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).default("0").notNull(),
    total: numeric("total", { precision: 12, scale: 2 }).default("0").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    numberIdx: uniqueIndex("invoice_number_idx").on(table.invoiceNumber),
  }),
);

export const prescriptions = pgTable("prescriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  appointmentId: uuid("appointment_id").references(() => appointments.id, {
    onDelete: "set null",
  }),
  diagnosis: text("diagnosis").notNull(),
  medicines: jsonb("medicines")
    .$type<Array<{ name: string; dosage: string; duration: string; instructions?: string }>>()
    .default([])
    .notNull(),
  notes: text("notes"),
  ...timestamps,
});

export const syncActions = pgTable("sync_actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  entity: varchar("entity", { length: 80 }).notNull(),
  action: varchar("action", { length: 40 }).notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  appointments: many(appointments),
  prescriptions: many(prescriptions),
}));

export const rolePermissionRelations = relations(rolePermissions, ({ many }) => ({
  roleAssignments: many(roleHasPermissions),
}));

export const roleHasPermissionRelations = relations(roleHasPermissions, ({ one }) => ({
  permission: one(rolePermissions, {
    fields: [roleHasPermissions.permissionId],
    references: [rolePermissions.id],
  }),
}));

export const patientRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
  invoices: many(invoices),
  prescriptions: many(prescriptions),
}));

export const appointmentRelations = relations(appointments, ({ one, many }) => ({
  patient: one(patients, { fields: [appointments.patientId], references: [patients.id] }),
  doctor: one(users, { fields: [appointments.doctorId], references: [users.id] }),
  invoices: many(invoices),
  prescriptions: many(prescriptions),
}));

export const invoiceRelations = relations(invoices, ({ one }) => ({
  patient: one(patients, { fields: [invoices.patientId], references: [patients.id] }),
  appointment: one(appointments, {
    fields: [invoices.appointmentId],
    references: [appointments.id],
  }),
}));

export const prescriptionRelations = relations(prescriptions, ({ one }) => ({
  patient: one(patients, { fields: [prescriptions.patientId], references: [patients.id] }),
  doctor: one(users, { fields: [prescriptions.doctorId], references: [users.id] }),
  appointment: one(appointments, {
    fields: [prescriptions.appointmentId],
    references: [appointments.id],
  }),
}));
