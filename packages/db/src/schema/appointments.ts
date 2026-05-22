import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  date,
  time,
  pgEnum,
} from "drizzle-orm/pg-core";
import { patients } from "./patients";
import { doctorAvailabilitySlots, doctors } from "./doctors";
import { users } from "./auth";
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "booked",
  "confirmed",
  "checked_in",
  "in_consultation",
  "completed",
  "cancelled",
  "rescheduled",
  "no_show",
]);

export const appointmentTypeEnum = pgEnum("appointment_type", [
  "in_clinic",
  "online",
  "walk_in",
]);

export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  doctorId: uuid("doctor_id").references(() => doctors.id, { onDelete: "cascade" }).notNull(),
  slotId: uuid("slot_id").references(() => doctorAvailabilitySlots.id, { onDelete: "set null" }),
  appointmentDate: date("appointment_date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time"),
  type: appointmentTypeEnum("type").default("in_clinic").notNull(),
  status: appointmentStatusEnum("status").default("booked").notNull(),
  reason: text("reason"),
  notes: text("notes"),
  queueTokenNumber: integer("queue_token_number"),
  createdById: uuid("created_by_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const appointmentStatusLogs = pgTable("appointment_status_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "cascade" }).notNull(),
  oldStatus: appointmentStatusEnum("old_status"),
  newStatus: appointmentStatusEnum("new_status").notNull(),
  changedById: uuid("changed_by_id").references(() => users.id, { onDelete: "set null" }),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const appointmentReschedules = pgTable("appointment_reschedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "cascade" }).notNull(),
  oldDate: date("old_date").notNull(),
  oldStartTime: time("old_start_time").notNull(),
  newDate: date("new_date").notNull(),
  newStartTime: time("new_start_time").notNull(),
  reason: text("reason"),
  rescheduledById: uuid("rescheduled_by_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});