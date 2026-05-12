import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 30 }).notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  age: integer("age"),
  gender: varchar("gender", { length: 20 }).notNull().default("unknown"),
  bloodGroup: varchar("blood_group", { length: 8 }),
  doctorAssigned: varchar("doctor_assigned", { length: 160 }),
  admissionDate: date("admission_date"),
  dischargeDate: date("discharge_date"),
  status: varchar("status", { length: 40 }).notNull().default("active"),
  address: text("address"),
  allergies: text("allergies"),
  medicalHistory: text("medical_history"),
  insuranceProvider: varchar("insurance_provider", { length: 160 }),
  insurancePolicyNumber: varchar("insurance_policy_number", { length: 120 }),
  insuranceMemberId: varchar("insurance_member_id", { length: 120 }),
  insuranceGroupNumber: varchar("insurance_group_number", { length: 120 }),
  portalLoginEnabled: boolean("portal_login_enabled").default(false).notNull(),
  portalLastLoginAt: timestamp("portal_last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const patientFamilyMembers = pgTable("patient_family_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  relationship: varchar("relationship", { length: 80 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const patientVisits = pgTable("patient_visits", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  visitDate: timestamp("visit_date", { withTimezone: true }).notNull(),
  visitType: varchar("visit_type", { length: 80 }).notNull().default("consultation"),
  doctorName: varchar("doctor_name", { length: 160 }),
  chiefComplaint: text("chief_complaint"),
  diagnosis: text("diagnosis"),
  treatmentPlan: text("treatment_plan"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const patientDocuments = pgTable("patient_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 180 }).notNull(),
  documentType: varchar("document_type", { length: 80 }).notNull().default("other"),
  fileUrl: text("file_url").notNull(),
  fileName: varchar("file_name", { length: 255 }),
  uploadedBy: varchar("uploaded_by", { length: 160 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const patientFeedback = pgTable("patient_feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  source: varchar("source", { length: 80 }).notNull().default("clinic"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
