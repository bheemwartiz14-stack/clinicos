import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  date,
  time,
  pgEnum,
  boolean,
  jsonb,
  index,
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
  "tele_consult",
  "walk_in",
]);

export const recurringPatternEnum = pgEnum("recurring_pattern", [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
]);

export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "cascade" }).notNull(),
  doctorId: uuid("doctor_id").references(() => doctors.id, { onDelete: "cascade" }).notNull(),
  slotId: uuid("slot_id").references(() => doctorAvailabilitySlots.id, { onDelete: "set null" }),
  appointmentNumber: varchar("appointment_number", { length: 50 }),
  appointmentDate: date("appointment_date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time"),
  type: appointmentTypeEnum("type").default("in_clinic").notNull(),
  status: appointmentStatusEnum("status").default("booked").notNull(),
  reason: text("reason"),
  notes: text("notes"),
  queueTokenNumber: integer("queue_token_number"),
  consultationLink: text("consultation_link"),
  isRecurring: boolean("is_recurring").default(false).notNull(),
  recurringPattern: recurringPatternEnum("recurring_pattern"),
  recurringEndDate: date("recurring_end_date"),
  parentAppointmentId: uuid("parent_appointment_id"),
  googleCalendarEventId: text("google_calendar_event_id"),
  calendarId: text("calendar_id"),
  meetingLink: text("meeting_link"),
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

export const appointmentLogActionEnum = pgEnum("appointment_log_action", [
  "BOOKED",
  "UPDATED",
  "RESCHEDULED",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW",
  "CALENDAR_CREATED",
  "CALENDAR_UPDATED",
  "EMAIL_SENT",
  "NOTIFICATION_SENT",
]);

export const appointmentLogs = pgTable(
  "appointment_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "cascade" }).notNull(),
    action: appointmentLogActionEnum("action").notNull(),
    message: text("message"),
    performedBy: uuid("performed_by").references(() => users.id, { onDelete: "set null" }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("appointment_logs_appointment_id_idx").on(table.appointmentId),
    index("appointment_logs_action_idx").on(table.action),
    index("appointment_logs_created_at_idx").on(table.createdAt),
  ],
);