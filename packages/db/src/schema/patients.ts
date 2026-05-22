import {
    pgTable,
    uuid,
    varchar,
    text,
    boolean,
    timestamp,
    date,
} from "drizzle-orm/pg-core";
import { doctors } from "./doctors";


export const patients = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  email: varchar("email", { length: 255 }),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender", { length: 50 }),
  bloodGroup: varchar("blood_group", { length: 20 }),
  address: text("address"),
  emergencyContactName: varchar("emergency_contact_name", { length: 150 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 30 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const patientMedicalHistories = pgTable("patient_medical_histories", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  condition: varchar("condition", { length: 255 }).notNull(),
  description: text("description"),
  diagnosedAt: date("diagnosed_at"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const patientNotes = pgTable("patient_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  doctorId: uuid("doctor_id").references(() => doctors.id, { onDelete: "set null" }),
  note: text("note").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});