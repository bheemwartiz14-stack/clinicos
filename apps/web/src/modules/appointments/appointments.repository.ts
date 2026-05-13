import { db, schema } from "@mediclinicpro/db";
import { and, asc, count, desc, eq, gt, gte, ilike, inArray, lt, or, sql } from "drizzle-orm";
import type {
  AppointmentListItem,
  AppointmentsPageSearchParams,
  BranchAppointmentOption,
  CalendarSlot,
  CreateAppointmentInput,
  DoctorAppointmentOption,
  PatientAppointmentOption,
} from "./appointments.types";

function mapAppointment(row: {
  id: string;
  appointmentNumber: string;
  patientFirstName: string;
  patientLastName: string;
  patientPhone: string;
  doctorName: string;
  doctorSpecialization: string | null;
  branchName: string | null;
  branchCode: string | null;
  appointmentType: string;
  status: string;
  queueStatus: string;
  tokenNumber: number | null;
  priority: string;
  startAt: Date;
  endAt: Date;
  reason: string | null;
  onlineConsultationLink: string | null;
  reminderChannel: string;
  reminderStatus: string;
  recurrenceRule: string | null;
  createdAt: Date;
}): AppointmentListItem {
  return {
    ...row,
    patientName: `${row.patientFirstName} ${row.patientLastName}`.trim(),
    queueStatus: row.queueStatus as AppointmentListItem["queueStatus"],
    status: row.status as AppointmentListItem["status"],
  };
}

function dayRange(date: string) {
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { end, start };
}

function minutesFromTime(value: string) {
  const [hours = "0", minutes = "0"] = value.split(":");
  return Number(hours) * 60 + Number(minutes);
}

function dateAtMinutes(date: string, minutes: number) {
  const slotDate = new Date(`${date}T00:00:00`);
  slotDate.setMinutes(minutes);
  return slotDate;
}

function buildAppointmentSearch(query?: string) {
  const normalizedQuery = query?.trim();
  if (!normalizedQuery) return undefined;
  const search = `%${normalizedQuery}%`;

  return or(
    ilike(schema.patients.firstName, search),
    ilike(schema.patients.lastName, search),
    ilike(schema.patients.phone, search),
    ilike(schema.users.name, search),
    ilike(schema.appointments.appointmentNumber, search),
    ilike(schema.appointments.reason, search),
  );
}

function appointmentSelection() {
  return {
    appointmentNumber: schema.appointments.appointmentNumber,
    appointmentType: schema.appointments.appointmentType,
    branchCode: schema.branches.code,
    branchName: schema.branches.name,
    createdAt: schema.appointments.createdAt,
    doctorName: schema.users.name,
    doctorSpecialization: schema.doctors.specialization,
    endAt: schema.appointments.endAt,
    id: schema.appointments.id,
    onlineConsultationLink: schema.appointments.onlineConsultationLink,
    patientFirstName: schema.patients.firstName,
    patientLastName: schema.patients.lastName,
    patientPhone: schema.patients.phone,
    priority: schema.appointments.priority,
    queueStatus: schema.appointments.queueStatus,
    reason: schema.appointments.reason,
    recurrenceRule: schema.appointments.recurrenceRule,
    reminderChannel: schema.appointments.reminderChannel,
    reminderStatus: schema.appointments.reminderStatus,
    startAt: schema.appointments.startAt,
    status: schema.appointments.status,
    tokenNumber: schema.appointments.tokenNumber,
  };
}

export async function findAppointments(filters: AppointmentsPageSearchParams = {}) {
  const selectedDate = filters.date || new Date().toISOString().slice(0, 10);
  const range = dayRange(selectedDate);
  const conditions = [
    gte(schema.appointments.startAt, range.start),
    lt(schema.appointments.startAt, range.end),
    buildAppointmentSearch(filters.q),
    filters.doctorId ? eq(schema.appointments.doctorId, filters.doctorId) : undefined,
    filters.status ? eq(schema.appointments.status, filters.status) : undefined,
  ].filter(Boolean);

  const rows = await db
    .select(appointmentSelection())
    .from(schema.appointments)
    .innerJoin(schema.patients, eq(schema.appointments.patientId, schema.patients.id))
    .innerJoin(schema.doctors, eq(schema.appointments.doctorId, schema.doctors.id))
    .innerJoin(schema.users, eq(schema.doctors.userId, schema.users.id))
    .leftJoin(schema.branches, eq(schema.appointments.branchId, schema.branches.id))
    .where(and(...conditions))
    .orderBy(asc(schema.appointments.startAt))
    .limit(100);

  return rows.map(mapAppointment);
}

export async function getAppointmentStats(date: string) {
  const range = dayRange(date);
  const todayFilter = and(
    gte(schema.appointments.startAt, range.start),
    lt(schema.appointments.startAt, range.end),
  );
  const [today, pendingConfirmation, checkedIn, onlineConsultations] = await Promise.all([
    db.select({ value: count() }).from(schema.appointments).where(todayFilter),
    db
      .select({ value: count() })
      .from(schema.appointments)
      .where(and(todayFilter, inArray(schema.appointments.status, ["booked", "confirmed"]))),
    db
      .select({ value: count() })
      .from(schema.appointments)
      .where(and(todayFilter, inArray(schema.appointments.queueStatus, ["waiting", "called"]))),
    db
      .select({ value: count() })
      .from(schema.appointments)
      .where(and(todayFilter, eq(schema.appointments.appointmentType, "online"))),
  ]);

  return {
    checkedIn: Number(checkedIn[0]?.value ?? 0),
    onlineConsultations: Number(onlineConsultations[0]?.value ?? 0),
    pendingConfirmation: Number(pendingConfirmation[0]?.value ?? 0),
    today: Number(today[0]?.value ?? 0),
  };
}

export async function findAppointmentDoctors(): Promise<DoctorAppointmentOption[]> {
  const rows = await db
    .select({
      branchId: schema.doctors.branchId,
      id: schema.doctors.id,
      label: schema.users.name,
      specialization: schema.doctors.specialization,
    })
    .from(schema.doctors)
    .innerJoin(schema.users, eq(schema.doctors.userId, schema.users.id))
    .where(eq(schema.doctors.isAvailable, true))
    .orderBy(asc(schema.users.name));

  return rows;
}

export async function findAppointmentPatients(): Promise<PatientAppointmentOption[]> {
  const rows = await db
    .select({
      id: schema.patients.id,
      label: sql<string>`concat(${schema.patients.firstName}, ' ', ${schema.patients.lastName})`,
      phone: schema.patients.phone,
    })
    .from(schema.patients)
    .orderBy(desc(schema.patients.updatedAt))
    .limit(100);

  return rows;
}

export async function findAppointmentBranches(): Promise<BranchAppointmentOption[]> {
  return db
    .select({
      code: schema.branches.code,
      id: schema.branches.id,
      label: schema.branches.name,
    })
    .from(schema.branches)
    .where(eq(schema.branches.isActive, true))
    .orderBy(asc(schema.branches.name));
}

export async function findCalendarSlots(
  filters: Pick<AppointmentsPageSearchParams, "date" | "doctorId">,
) {
  const selectedDate = filters.date || new Date().toISOString().slice(0, 10);
  const range = dayRange(selectedDate);
  const dayOfWeek = range.start.getDay();
  const availabilityConditions = [
    eq(schema.doctorAvailabilitySlots.isAvailable, true),
    filters.doctorId ? eq(schema.doctorAvailabilitySlots.doctorId, filters.doctorId) : undefined,
    or(
      eq(schema.doctorAvailabilitySlots.dayOfWeek, dayOfWeek),
      and(
        gte(schema.doctorAvailabilitySlots.availableDate, range.start),
        lt(schema.doctorAvailabilitySlots.availableDate, range.end),
      ),
    ),
  ].filter(Boolean);

  const availabilityRows = await db
    .select({
      availabilitySlotId: schema.doctorAvailabilitySlots.id,
      branchId: schema.doctorAvailabilitySlots.branchId,
      branchName: schema.branches.name,
      doctorId: schema.doctorAvailabilitySlots.doctorId,
      doctorName: schema.users.name,
      endTime: schema.doctorAvailabilitySlots.endTime,
      maxAppointments: schema.doctorAvailabilitySlots.maxAppointments,
      slotDurationMinutes: schema.doctorAvailabilitySlots.slotDurationMinutes,
      startTime: schema.doctorAvailabilitySlots.startTime,
    })
    .from(schema.doctorAvailabilitySlots)
    .innerJoin(schema.doctors, eq(schema.doctorAvailabilitySlots.doctorId, schema.doctors.id))
    .innerJoin(schema.users, eq(schema.doctors.userId, schema.users.id))
    .leftJoin(schema.branches, eq(schema.doctorAvailabilitySlots.branchId, schema.branches.id))
    .where(and(...availabilityConditions))
    .orderBy(asc(schema.users.name), asc(schema.doctorAvailabilitySlots.startTime));

  const appointments = await db
    .select({
      doctorId: schema.appointments.doctorId,
      endAt: schema.appointments.endAt,
      startAt: schema.appointments.startAt,
      status: schema.appointments.status,
    })
    .from(schema.appointments)
    .where(
      and(
        gte(schema.appointments.startAt, range.start),
        lt(schema.appointments.startAt, range.end),
        filters.doctorId ? eq(schema.appointments.doctorId, filters.doctorId) : undefined,
        sql`${schema.appointments.status} not in ('cancelled', 'no_show', 'rescheduled')`,
      ),
    );

  const slots: CalendarSlot[] = [];

  for (const row of availabilityRows) {
    const startMinute = minutesFromTime(row.startTime);
    const endMinute = minutesFromTime(row.endTime);
    const duration = row.slotDurationMinutes || 15;

    for (let minute = startMinute; minute + duration <= endMinute; minute += duration) {
      const startAt = dateAtMinutes(selectedDate, minute);
      const endAt = dateAtMinutes(selectedDate, minute + duration);
      const booked = appointments.filter(
        (appointment) =>
          appointment.doctorId === row.doctorId &&
          appointment.startAt < endAt &&
          appointment.endAt > startAt,
      ).length;

      slots.push({
        availabilitySlotId: row.availabilitySlotId,
        available: booked < row.maxAppointments,
        booked,
        branchId: row.branchId,
        branchName: row.branchName,
        capacity: row.maxAppointments,
        doctorId: row.doctorId,
        doctorName: row.doctorName,
        durationMinutes: duration,
        endAt,
        id: `${row.availabilitySlotId}-${minute}`,
        startAt,
      });
    }
  }

  return slots.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}

export async function createAppointment(input: CreateAppointmentInput, createdById: string) {
  const endAt = new Date(input.startAt);
  endAt.setMinutes(endAt.getMinutes() + input.durationMinutes);
  const range = dayRange(input.startAt.toISOString().slice(0, 10));

  if (input.availabilitySlotId) {
    const [slot] = await db
      .select({
        branchId: schema.doctorAvailabilitySlots.branchId,
        doctorId: schema.doctorAvailabilitySlots.doctorId,
        endTime: schema.doctorAvailabilitySlots.endTime,
        isAvailable: schema.doctorAvailabilitySlots.isAvailable,
        startTime: schema.doctorAvailabilitySlots.startTime,
      })
      .from(schema.doctorAvailabilitySlots)
      .where(eq(schema.doctorAvailabilitySlots.id, input.availabilitySlotId))
      .limit(1);

    if (!slot?.isAvailable || slot.doctorId !== input.doctorId) {
      throw new Error("Selected doctor slot is not available.");
    }

    const startMinute = input.startAt.getHours() * 60 + input.startAt.getMinutes();
    if (
      startMinute < minutesFromTime(slot.startTime) ||
      startMinute >= minutesFromTime(slot.endTime)
    ) {
      throw new Error("Selected appointment time is outside the doctor's availability.");
    }
  }

  const [conflict] = await db
    .select({ id: schema.appointments.id })
    .from(schema.appointments)
    .where(
      and(
        eq(schema.appointments.doctorId, input.doctorId),
        lt(schema.appointments.startAt, endAt),
        gt(schema.appointments.endAt, input.startAt),
        sql`${schema.appointments.status} not in ('cancelled', 'no_show', 'rescheduled')`,
      ),
    )
    .limit(1);

  if (conflict) {
    throw new Error("This doctor already has an appointment in that time slot.");
  }

  const [{ value: tokenCount }] = await db
    .select({ value: count() })
    .from(schema.appointments)
    .where(
      and(
        eq(schema.appointments.doctorId, input.doctorId),
        gte(schema.appointments.startAt, range.start),
        lt(schema.appointments.startAt, range.end),
      ),
    );

  const now = new Date();
  const appointmentNumber = `APT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Date.now()).slice(-6)}`;
  const tokenNumber = Number(tokenCount ?? 0) + 1;

  const [appointment] = await db
    .insert(schema.appointments)
    .values({
      appointmentNumber,
      appointmentType: input.appointmentType,
      availabilitySlotId: input.availabilitySlotId,
      branchId: input.branchId,
      createdById,
      doctorId: input.doctorId,
      endAt,
      notes: input.notes,
      onlineConsultationLink: input.onlineConsultationLink || null,
      patientId: input.patientId,
      priority: input.priority,
      reason: input.reason,
      recurrenceRule: input.recurrenceRule,
      reminderChannel: input.reminderChannel,
      startAt: input.startAt,
      status: input.status,
      tokenNumber,
    })
    .returning();

  if (appointment) {
    await db.insert(schema.appointmentStatusHistory).values({
      appointmentId: appointment.id,
      changedById: createdById,
      toStatus: appointment.status,
    });
  }

  return appointment;
}

export async function updateAppointmentFlow(input: {
  appointmentId: string;
  status: string;
  queueStatus: string;
  changedById: string;
}) {
  const [current] = await db
    .select({
      queueStatus: schema.appointments.queueStatus,
      status: schema.appointments.status,
    })
    .from(schema.appointments)
    .where(eq(schema.appointments.id, input.appointmentId))
    .limit(1);

  if (!current) {
    throw new Error("Appointment not found.");
  }

  const [appointment] = await db
    .update(schema.appointments)
    .set({
      queueStatus: input.queueStatus,
      status: input.status,
    })
    .where(eq(schema.appointments.id, input.appointmentId))
    .returning();

  if (current.status !== input.status) {
    await db.insert(schema.appointmentStatusHistory).values({
      appointmentId: input.appointmentId,
      changedById: input.changedById,
      fromStatus: current.status,
      toStatus: input.status,
    });
  }

  return appointment;
}
