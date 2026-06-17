import { and, eq, gte, lte, asc, sql } from "drizzle-orm";
import {
  db,
  appointments,
  appointmentStatusLogs,
  appointmentReschedules,
  patients,
  doctors,
  users,
  doctorAvailabilitySlots,
  doctorSpecialties,
} from "@mediclinic/db";
import type { AppointmentJoinRow, AppointmentListFilters } from "../types/appointment.types";
import { toAppointmentRecord } from "../helpers/appointment.helpers";

function buildBaseQuery() {
  return db
    .select({
      appointment: appointments,
      patient: patients,
      doctor: doctors,
      user: users,
      specialty: doctorSpecialties,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .innerJoin(users, eq(doctors.userId, users.id))
    .leftJoin(doctorSpecialties, eq(doctors.specialtyId, doctorSpecialties.id));
}

export const appointmentRepository = {
  async findAll(filters?: AppointmentListFilters) {
    const conditions: ReturnType<typeof eq>[] = [];

    if (filters?.date) conditions.push(eq(appointments.appointmentDate, filters.date));
    if (filters?.doctorId) conditions.push(eq(appointments.doctorId, filters.doctorId));
    if (filters?.dateFrom) conditions.push(gte(appointments.appointmentDate, filters.dateFrom));
    if (filters?.dateTo) conditions.push(lte(appointments.appointmentDate, filters.dateTo));

    let query = buildBaseQuery();
    if (conditions.length) query = query.where(and(...conditions)) as any;
    const rows = await query.orderBy(asc(appointments.appointmentDate), asc(appointments.startTime));
    return rows.map(toAppointmentRecord);
  },

  async findById(id: string) {
    const [row] = await buildBaseQuery()
      .where(eq(appointments.id, id))
      .limit(1);

    return row ? toAppointmentRecord(row) : null;
  },

  async findRawById(id: string) {
    const [row] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
    return row ?? null;
  },

  async insert(data: typeof appointments.$inferInsert) {
    const [created] = await db.insert(appointments).values(data).returning();
    return created;
  },

  async updateById(id: string, data: Partial<typeof appointments.$inferInsert>) {
    await db.update(appointments).set(data).where(eq(appointments.id, id));
  },

  async getMaxTokenNumber(doctorId: string, date: string) {
    const [result] = await db
      .select({ max: sql<number>`COALESCE(MAX(${appointments.queueTokenNumber}), 0)` })
      .from(appointments)
      .where(and(
        eq(appointments.doctorId, doctorId),
        eq(appointments.appointmentDate, date),
      ));
    return result?.max ?? 0;
  },

  async markSlotBooked(slotId: string, isBooked: boolean) {
    await db.update(doctorAvailabilitySlots).set({ isBooked }).where(eq(doctorAvailabilitySlots.id, slotId));
  },

  async insertStatusLog(data: typeof appointmentStatusLogs.$inferInsert) {
    await db.insert(appointmentStatusLogs).values(data);
  },

  async insertRescheduleLog(data: typeof appointmentReschedules.$inferInsert) {
    await db.insert(appointmentReschedules).values(data);
  },

  async findQueue(doctorId: string, date: string) {
    const rows = await db
      .select()
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .where(and(
        eq(appointments.doctorId, doctorId),
        eq(appointments.appointmentDate, date),
      ))
      .orderBy(asc(appointments.queueTokenNumber));

    return rows.map((row) => ({
      id: row.appointments.id,
      tokenNumber: row.appointments.queueTokenNumber,
      patientName: row.patients.fullName,
      startTime: row.appointments.startTime,
      status: row.appointments.status,
    }));
  },

  async findDoctors() {
    const rows = await db
      .select()
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .leftJoin(doctorSpecialties, eq(doctors.specialtyId, doctorSpecialties.id))
      .where(eq(users.status, "active"));

    return rows.map((row) => ({
      id: row.doctors.id,
      name: [row.users.firstName, row.users.lastName].filter(Boolean).join(" "),
      specialty: row.doctor_specialties?.name ?? null,
    }));
  },

  async findAvailableSlots(doctorId: string, date: string) {
    const slots = await db
      .select({ slot: doctorAvailabilitySlots, doctor: doctors, user: users, specialty: doctorSpecialties })
      .from(doctorAvailabilitySlots)
      .innerJoin(doctors, eq(doctorAvailabilitySlots.doctorId, doctors.id))
      .innerJoin(users, eq(doctors.userId, users.id))
      .leftJoin(doctorSpecialties, eq(doctors.specialtyId, doctorSpecialties.id))
      .where(and(
        eq(doctorAvailabilitySlots.doctorId, doctorId),
        eq(doctorAvailabilitySlots.slotDate, date),
        eq(doctorAvailabilitySlots.isBooked, false),
        eq(doctorAvailabilitySlots.isBlocked, false),
      ))
      .orderBy(asc(doctorAvailabilitySlots.startTime));

    return slots.map((s) => ({
      id: s.slot.id,
      slotDate: s.slot.slotDate,
      startTime: s.slot.startTime,
      endTime: s.slot.endTime,
      doctorId: s.slot.doctorId,
      doctorName: [s.user.firstName, s.user.lastName].filter(Boolean).join(" "),
      doctorSpecialty: s.specialty?.name ?? null,
      isBooked: false,
    }));
  },

  async getSlotHours(doctorId: string, date: string) {
    const rows = await db
      .select({ startTime: doctorAvailabilitySlots.startTime })
      .from(doctorAvailabilitySlots)
      .where(
        and(
          eq(doctorAvailabilitySlots.doctorId, doctorId),
          eq(doctorAvailabilitySlots.slotDate, date),
          eq(doctorAvailabilitySlots.isBlocked, false),
        ),
      )
      .orderBy(asc(doctorAvailabilitySlots.startTime));

    const hours = new Set<string>();
    for (const row of rows) {
      hours.add(row.startTime.slice(0, 2));
    }
    return Array.from(hours).sort().map((h) => `${h}:00`);
  },

  async findAllSlots(doctorId: string, date: string) {
    const slots = await db
      .select({ slot: doctorAvailabilitySlots, doctor: doctors, user: users, specialty: doctorSpecialties })
      .from(doctorAvailabilitySlots)
      .innerJoin(doctors, eq(doctorAvailabilitySlots.doctorId, doctors.id))
      .innerJoin(users, eq(doctors.userId, users.id))
      .leftJoin(doctorSpecialties, eq(doctors.specialtyId, doctorSpecialties.id))
      .where(and(
        eq(doctorAvailabilitySlots.doctorId, doctorId),
        eq(doctorAvailabilitySlots.slotDate, date),
        eq(doctorAvailabilitySlots.isBlocked, false),
      ))
      .orderBy(asc(doctorAvailabilitySlots.startTime));

    return slots.map((s) => ({
      id: s.slot.id,
      slotDate: s.slot.slotDate,
      startTime: s.slot.startTime,
      endTime: s.slot.endTime,
      doctorId: s.slot.doctorId,
      doctorName: [s.user.firstName, s.user.lastName].filter(Boolean).join(" "),
      doctorSpecialty: s.specialty?.name ?? null,
      isBooked: s.slot.isBooked,
    }));
  },
};
