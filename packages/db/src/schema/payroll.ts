import {
  pgTable,
  uuid,
  boolean,
  timestamp,
  integer,
  numeric,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { doctors } from "./doctors";
import { appointments } from "./appointments";
import { invoices } from "./billing";

export const payoutStatusEnum = pgEnum("payout_status", [
  "pending",
  "paid",
  "hold",
  "cancelled",
]);

export const salaryTypeEnum = pgEnum("salary_type", [
  "fixed",
  "commission",
  "fixed_plus_commission",
]);


export const doctorSalaryStructures = pgTable("doctor_salary_structures", {
  id: uuid("id").defaultRandom().primaryKey(),
  doctorId: uuid("doctor_id").references(() => doctors.id, { onDelete: "cascade" }).notNull(),
  salaryType: salaryTypeEnum("salary_type").notNull(),
  fixedSalary: numeric("fixed_salary", { precision: 10, scale: 2 }).default("0").notNull(),
  commissionPercentage: numeric("commission_percentage", { precision: 5, scale: 2 }).default("0").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const doctorEarnings = pgTable("doctor_earnings", {
  id: uuid("id").defaultRandom().primaryKey(),

  doctorId: uuid("doctor_id").references(() => doctors.id, { onDelete: "cascade" }).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "set null" }),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
  consultationAmount: numeric("consultation_amount", { precision: 10, scale: 2 }).notNull(),
  commissionAmount: numeric("commission_amount", { precision: 10, scale: 2 }).default("0").notNull(),
  earningDate: date("earning_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const doctorPayouts = pgTable("doctor_payouts", {
  id: uuid("id").defaultRandom().primaryKey(),

  doctorId: uuid("doctor_id").references(() => doctors.id, { onDelete: "cascade" }).notNull(),

  month: integer("month").notNull(),
  year: integer("year").notNull(),

  totalEarnings: numeric("total_earnings", { precision: 10, scale: 2 }).default("0").notNull(),
  fixedSalaryAmount: numeric("fixed_salary_amount", { precision: 10, scale: 2 }).default("0").notNull(),
  commissionAmount: numeric("commission_amount", { precision: 10, scale: 2 }).default("0").notNull(),
  paidAmount: numeric("paid_amount", { precision: 10, scale: 2 }).default("0").notNull(),

  status: payoutStatusEnum("status").default("pending").notNull(),

  paidAt: timestamp("paid_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});