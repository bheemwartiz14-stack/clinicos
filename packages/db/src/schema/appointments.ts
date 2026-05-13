import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { branches } from "./branches";
import { doctors } from "./doctors";
import { patients } from "./patients";

export const doctorAvailabilitySlots = pgTable(
  "doctor_availability_slots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    doctorId: uuid("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id").references(() => branches.id, { onDelete: "set null" }),
    dayOfWeek: integer("day_of_week"),
    availableDate: timestamp("available_date", { withTimezone: true }),
    startTime: varchar("start_time", { length: 10 }).notNull(),
    endTime: varchar("end_time", { length: 10 }).notNull(),
    slotDurationMinutes: integer("slot_duration_minutes").default(15).notNull(),
    maxAppointments: integer("max_appointments").default(1).notNull(),
    isAvailable: boolean("is_available").default(true).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("availability_doctor_idx").on(table.doctorId),
    index("availability_branch_idx").on(table.branchId),
    index("availability_day_idx").on(table.dayOfWeek),
    index("availability_date_idx").on(table.availableDate),
  ],
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
      .references(() => doctors.id, { onDelete: "restrict" }),
    branchId: uuid("branch_id").references(() => branches.id, { onDelete: "set null" }),
    availabilitySlotId: uuid("availability_slot_id").references(() => doctorAvailabilitySlots.id, {
      onDelete: "set null",
    }),
    appointmentNumber: varchar("appointment_number", { length: 40 }).notNull().unique(),
    appointmentType: varchar("appointment_type", { length: 60 }).default("clinic").notNull(),
    status: varchar("status", { length: 40 }).default("booked").notNull(),
    queueStatus: varchar("queue_status", { length: 40 }).default("not_checked_in").notNull(),
    tokenNumber: integer("token_number"),
    priority: varchar("priority", { length: 30 }).default("normal").notNull(),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    reason: text("reason"),
    notes: text("notes"),
    cancellationReason: text("cancellation_reason"),
    onlineConsultationLink: text("online_consultation_link"),
    reminderChannel: varchar("reminder_channel", { length: 30 }).default("whatsapp").notNull(),
    reminderStatus: varchar("reminder_status", { length: 40 }).default("pending").notNull(),
    recurrenceRule: varchar("recurrence_rule", { length: 120 }),
    recurrenceSeriesId: uuid("recurrence_series_id"),
    createdById: uuid("created_by_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("appointments_patient_idx").on(table.patientId),
    index("appointments_doctor_idx").on(table.doctorId),
    index("appointments_branch_idx").on(table.branchId),
    index("appointments_start_idx").on(table.startAt),
    index("appointments_status_idx").on(table.status),
    index("appointments_queue_status_idx").on(table.queueStatus),
    index("appointments_series_idx").on(table.recurrenceSeriesId),
  ],
);

export const appointmentStatusHistory = pgTable(
  "appointment_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    appointmentId: uuid("appointment_id")
      .notNull()
      .references(() => appointments.id, { onDelete: "cascade" }),
    fromStatus: varchar("from_status", { length: 40 }),
    toStatus: varchar("to_status", { length: 40 }).notNull(),
    note: text("note"),
    changedById: uuid("changed_by_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("appointment_status_history_appointment_idx").on(table.appointmentId),
    index("appointment_status_history_status_idx").on(table.toStatus),
  ],
);

export const appointmentReminders = pgTable(
  "appointment_reminders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    appointmentId: uuid("appointment_id")
      .notNull()
      .references(() => appointments.id, { onDelete: "cascade" }),
    channel: varchar("channel", { length: 30 }).notNull(),
    recipient: varchar("recipient", { length: 255 }).notNull(),
    message: text("message").notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    status: varchar("status", { length: 40 }).default("pending").notNull(),
    providerMessageId: varchar("provider_message_id", { length: 160 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("appointment_reminders_appointment_idx").on(table.appointmentId),
    index("appointment_reminders_schedule_idx").on(table.scheduledAt),
    index("appointment_reminders_status_idx").on(table.status),
  ],
);
