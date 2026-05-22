import {
    pgTable,
    uuid,
    varchar,
    text,
    boolean,
    timestamp,
    integer,
    numeric,
    date,
    time,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { departments } from "./staff";


/* =========================
   DOCTOR MANAGEMENT
========================= */

export const doctorSpecialties = pgTable("doctor_specialties", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 150 }).notNull().unique(),
    code: varchar("code", { length: 50 }).unique(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
});

export const doctors = pgTable("doctors", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
    departmentId: uuid("department_id").references(() => departments.id, { onDelete: "set null" }),
    specialtyId: uuid("specialty_id").references(() => doctorSpecialties.id, { onDelete: "set null" }),
    qualification: varchar("qualification", { length: 150 }),
    experienceYears: integer("experience_years"),
    licenseNumber: varchar("license_number", { length: 100 }).unique(),
    consultationFee: numeric("consultation_fee", { precision: 10, scale: 2 }).default("0").notNull(),
    bio: text("bio"),
    isAvailable: boolean("is_available").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const doctorSchedules = pgTable("doctor_schedules", {
    id: uuid("id").defaultRandom().primaryKey(),
    doctorId: uuid("doctor_id").references(() => doctors.id, { onDelete: "cascade" }).notNull(),
    dayOfWeek: integer("day_of_week").notNull(), // 0 Sunday - 6 Saturday
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    slotDurationMinutes: integer("slot_duration_minutes").default(30).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
});


export const doctorLeaveDates = pgTable("doctor_leave_dates", {
    id: uuid("id").defaultRandom().primaryKey(),
    doctorId: uuid("doctor_id").references(() => doctors.id, { onDelete: "cascade" }).notNull(),
    leaveDate: date("leave_date").notNull(),
    reason: text("reason"),
    isFullDay: boolean("is_full_day").default(true).notNull(),
    startTime: time("start_time"),
    endTime: time("end_time"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const doctorAvailabilitySlots = pgTable("doctor_availability_slots", {
    id: uuid("id").defaultRandom().primaryKey(),
    doctorId: uuid("doctor_id").references(() => doctors.id, { onDelete: "cascade" }).notNull(),
    slotDate: date("slot_date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    isBooked: boolean("is_booked").default(false).notNull(),
    isBlocked: boolean("is_blocked").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
