import { and, asc, count, eq, gte, inArray, ne, sql } from "drizzle-orm";
import {
  branches,
  db,
  departments,
  doctorAppointmentSlots,
  doctorConsultationSettings,
  doctorSchedules,
  doctors,
  users
} from "@mediclinic/db";
import type { Db } from "@mediclinic/db";
import type { DoctorConsultationSettingsInput, DoctorCreateInput, DoctorScheduleInput, DoctorUpdateInput } from "../schemas/doctor.schema";
import { doctorDaysOfWeek } from "../schemas/doctor.schema";
import type { DoctorSlotInsert } from "../types/doctor.types";
import { buildDoctorSlots } from "../helpers/slot-generation.helper";

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
type Executor = typeof db | Tx;

const dayIndexByName = new Map(doctorDaysOfWeek.map((day, index) => [day, index]));
const dayNameByIndex = new Map(doctorDaysOfWeek.map((day, index) => [index, day]));

function firstLastName(displayName: string) {
  const parts = displayName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "Doctor",
    lastName: parts.slice(1).join(" ") || "User"
  };
}

function normalizeDoctorRow<T extends { displayName: string | null; firstName: string; lastName: string; specialtyName?: string | null; consultationFee: string }>(row: T) {
  return {
    ...row,
    displayName: row.displayName ?? `${row.firstName} ${row.lastName}`.trim(),
    specialtyName: row.specialtyName ?? null
  };
}

function normalizeSchedule(row: typeof doctorSchedules.$inferSelect) {
  const dayIndex = row.dayOfWeek;
  return {
    id: row.id,
    doctorId: row.doctorId,
    dayOfWeek: row.dayName ?? dayNameByIndex.get(dayIndex) ?? "monday",
    dayIndex,
    startTime: row.startTime,
    endTime: row.endTime,
    slotDuration: row.slotDuration,
    isActive: row.isActive && row.isAvailable,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export async function getDoctorFormOptions() {
  const [branchRows, departmentRows] = await Promise.all([
    db.select({ id: branches.id, name: branches.name }).from(branches).orderBy(asc(branches.name)),
    db.select({ id: departments.id, name: departments.name }).from(departments).where(eq(departments.status, "active")).orderBy(asc(departments.name))
  ]);

  return {
    branches: branchRows,
    departments: departmentRows,
    specialties: departmentRows
  };
}

export async function getDoctors() {
  const rows = await db
    .select({
      id: doctors.id,
      userId: doctors.userId,
      branchId: doctors.branchId,
      branchName: branches.name,
      departmentId: doctors.departmentId,
      departmentName: departments.name,
      specialtyId: doctors.specialtyId,
      specialtyName: sql<string | null>`(select name from departments specialty where specialty.id = ${doctors.specialtyId})`,
      displayName: doctors.displayName,
      firstName: doctors.firstName,
      lastName: doctors.lastName,
      phone: doctors.phone,
      email: doctors.email,
      qualification: doctors.qualification,
      experienceYears: doctors.experienceYears,
      licenseNumber: doctors.licenseNumber,
      bio: doctors.bio,
      consultationFee: doctors.consultationFee,
      isActive: doctors.isActive,
      isAvailable: doctors.isAvailable,
      createdAt: doctors.createdAt,
      updatedAt: doctors.updatedAt
    })
    .from(doctors)
    .leftJoin(branches, eq(branches.id, doctors.branchId))
    .leftJoin(departments, eq(departments.id, doctors.departmentId))
    .orderBy(asc(doctors.displayName), asc(doctors.firstName));

  return Promise.all(rows.map(async (row) => {
    const [totalSlots, bookedSlots] = await Promise.all([
      db.select({ total: count() }).from(doctorAppointmentSlots).where(eq(doctorAppointmentSlots.doctorId, row.id)),
      db.select({ total: count() }).from(doctorAppointmentSlots).where(and(eq(doctorAppointmentSlots.doctorId, row.id), eq(doctorAppointmentSlots.status, "booked")))
    ]);

    return {
      ...normalizeDoctorRow(row),
      slotCount: totalSlots[0]?.total ?? 0,
      bookedSlotCount: bookedSlots[0]?.total ?? 0
    };
  }));
}

export async function getDoctorById(id: string) {
  const [row] = await db
    .select({
      id: doctors.id,
      userId: doctors.userId,
      branchId: doctors.branchId,
      branchName: branches.name,
      departmentId: doctors.departmentId,
      departmentName: departments.name,
      specialtyId: doctors.specialtyId,
      specialtyName: sql<string | null>`(select name from departments specialty where specialty.id = ${doctors.specialtyId})`,
      displayName: doctors.displayName,
      firstName: doctors.firstName,
      lastName: doctors.lastName,
      phone: doctors.phone,
      email: doctors.email,
      qualification: doctors.qualification,
      experienceYears: doctors.experienceYears,
      licenseNumber: doctors.licenseNumber,
      bio: doctors.bio,
      consultationFee: doctors.consultationFee,
      isActive: doctors.isActive,
      isAvailable: doctors.isAvailable,
      createdAt: doctors.createdAt,
      updatedAt: doctors.updatedAt
    })
    .from(doctors)
    .leftJoin(branches, eq(branches.id, doctors.branchId))
    .leftJoin(departments, eq(departments.id, doctors.departmentId))
    .where(eq(doctors.id, id))
    .limit(1);

  if (!row) return null;
  const [slotCountRows, bookedCountRows] = await Promise.all([
    db.select({ total: count() }).from(doctorAppointmentSlots).where(eq(doctorAppointmentSlots.doctorId, id)),
    db.select({ total: count() }).from(doctorAppointmentSlots).where(and(eq(doctorAppointmentSlots.doctorId, id), eq(doctorAppointmentSlots.status, "booked")))
  ]);

  return {
    ...normalizeDoctorRow(row),
    slotCount: slotCountRows[0]?.total ?? 0,
    bookedSlotCount: bookedCountRows[0]?.total ?? 0
  };
}

export async function getDoctorByUserId(userId: string) {
  const [row] = await db.select().from(doctors).where(eq(doctors.userId, userId)).limit(1);
  return row ?? null;
}

export async function getDoctorSchedules(doctorId: string) {
  const rows = await db.select().from(doctorSchedules).where(eq(doctorSchedules.doctorId, doctorId)).orderBy(asc(doctorSchedules.dayOfWeek), asc(doctorSchedules.startTime));
  return rows.map(normalizeSchedule);
}

export async function upsertDoctorSchedules(doctorId: string, schedules: DoctorScheduleInput[], createdBy: string | null, executor: Executor = db) {
  await executor.delete(doctorSchedules).where(eq(doctorSchedules.doctorId, doctorId));
  if (schedules.length === 0) return [];

  const inserted = await executor
    .insert(doctorSchedules)
    .values(schedules.map((schedule) => ({
      doctorId,
      dayOfWeek: dayIndexByName.get(schedule.dayOfWeek) ?? 0,
      dayName: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      slotDuration: schedule.slotDuration,
      isActive: schedule.isActive,
      isAvailable: schedule.isActive,
      createdBy
    })))
    .returning();

  return inserted.map(normalizeSchedule);
}

export async function getDoctorSlots(doctorId: string, startDate?: string, endDate?: string) {
  const conditions = [eq(doctorAppointmentSlots.doctorId, doctorId)];
  if (startDate) conditions.push(gte(doctorAppointmentSlots.slotDate, startDate));
  if (endDate) conditions.push(sql`${doctorAppointmentSlots.slotDate} <= ${endDate}`);

  return db
    .select({
      id: doctorAppointmentSlots.id,
      doctorId: doctorAppointmentSlots.doctorId,
      scheduleId: doctorAppointmentSlots.scheduleId,
      slotDate: doctorAppointmentSlots.slotDate,
      startTime: doctorAppointmentSlots.startTime,
      endTime: doctorAppointmentSlots.endTime,
      status: doctorAppointmentSlots.status,
      appointmentId: doctorAppointmentSlots.appointmentId,
      createdAt: doctorAppointmentSlots.createdAt,
      updatedAt: doctorAppointmentSlots.updatedAt
    })
    .from(doctorAppointmentSlots)
    .where(and(...conditions))
    .orderBy(asc(doctorAppointmentSlots.slotDate), asc(doctorAppointmentSlots.startTime));
}

export async function createDoctorSlots(slots: DoctorSlotInsert[], executor: Executor = db) {
  if (slots.length === 0) return [];
  return executor.insert(doctorAppointmentSlots).values(slots).onConflictDoNothing().returning();
}

export async function deleteFutureAvailableSlots(doctorId: string, fromDate: string, executor: Executor = db) {
  return executor.delete(doctorAppointmentSlots).where(and(
    eq(doctorAppointmentSlots.doctorId, doctorId),
    gte(doctorAppointmentSlots.slotDate, fromDate),
    eq(doctorAppointmentSlots.status, "available")
  ));
}

export async function getDoctorConsultationSettings(doctorId: string) {
  const [settings] = await db.select().from(doctorConsultationSettings).where(eq(doctorConsultationSettings.doctorId, doctorId)).limit(1);
  return settings ?? null;
}

export async function upsertDoctorConsultationSettings(doctorId: string, input: DoctorConsultationSettingsInput, executor: Executor = db) {
  const [settings] = await executor
    .insert(doctorConsultationSettings)
    .values({
      doctorId,
      consultationFee: String(input.consultationFee),
      followUpFee: String(input.followUpFee),
      followUpValidityDays: input.followUpValidityDays,
      defaultSlotDuration: input.defaultSlotDuration,
      allowOnlineConsultation: input.allowOnlineConsultation,
      onlineConsultationFee: String(input.onlineConsultationFee),
      notes: input.notes
    })
    .onConflictDoUpdate({
      target: doctorConsultationSettings.doctorId,
      set: {
        consultationFee: String(input.consultationFee),
        followUpFee: String(input.followUpFee),
        followUpValidityDays: input.followUpValidityDays,
        defaultSlotDuration: input.defaultSlotDuration,
        allowOnlineConsultation: input.allowOnlineConsultation,
        onlineConsultationFee: String(input.onlineConsultationFee),
        notes: input.notes,
        updatedAt: new Date()
      }
    })
    .returning();

  return settings;
}

export async function createDoctorWithUserAndSchedule(input: DoctorCreateInput & { createdBy: string; passwordHash: string }) {
  return db.transaction(async (tx) => {
    const [user] = await tx.insert(users).values({
      branchId: input.branchId,
      departmentId: input.departmentId,
      role: "doctor",
      name: input.displayName,
      email: input.email,
      username: input.email.split("@")[0],
      phone: input.phone,
      isActive: input.isActive,
      passwordHash: input.passwordHash
    }).returning();

    if (!user) throw new Error("Unable to create doctor user account.");
    const names = firstLastName(input.displayName);
    const [doctor] = await tx.insert(doctors).values({
      userId: user.id,
      branchId: input.branchId,
      departmentId: input.departmentId,
      specialtyId: input.specialtyId,
      displayName: input.displayName,
      firstName: names.firstName,
      lastName: names.lastName,
      email: input.email,
      phone: input.phone,
      specialization: "General Medicine",
      qualification: input.qualification,
      experienceYears: input.experienceYears,
      licenseNumber: input.licenseNumber,
      bio: input.bio,
      consultationFee: String(input.consultationSettings.consultationFee),
      isActive: input.isActive,
      isAvailable: input.isAvailable,
      visitDurationMinutes: input.consultationSettings.defaultSlotDuration
    }).returning();

    if (!doctor) throw new Error("Unable to create doctor profile.");
    await upsertDoctorConsultationSettings(doctor.id, input.consultationSettings, tx);
    const schedules = await upsertDoctorSchedules(doctor.id, input.schedules, input.createdBy, tx);
    const slotDoctor = {
      ...doctor,
      branchName: null,
      departmentName: null,
      specialtyName: null,
      displayName: doctor.displayName ?? `${doctor.firstName} ${doctor.lastName}`.trim(),
      slotCount: 0,
      bookedSlotCount: 0
    };
    const slots = buildDoctorSlots({ doctor: slotDoctor, schedules, existingSlotKeys: new Set(), days: 30 });
    await createDoctorSlots(slots, tx);
    return { doctor, schedules };
  });
}

export async function updateDoctorWithSchedule(input: DoctorUpdateInput & { updatedBy: string; passwordHash?: string }) {
  return db.transaction(async (tx) => {
    const existing = await tx.select().from(doctors).where(eq(doctors.id, input.id)).limit(1);
    if (!existing[0]) throw new Error("Doctor not found.");

    const names = firstLastName(input.displayName);
    const [doctor] = await tx.update(doctors).set({
      branchId: input.branchId,
      departmentId: input.departmentId,
      specialtyId: input.specialtyId,
      displayName: input.displayName,
      firstName: names.firstName,
      lastName: names.lastName,
      email: input.email,
      phone: input.phone,
      qualification: input.qualification,
      experienceYears: input.experienceYears,
      licenseNumber: input.licenseNumber,
      bio: input.bio,
      consultationFee: String(input.consultationSettings.consultationFee),
      isActive: input.isActive,
      isAvailable: input.isAvailable,
      visitDurationMinutes: input.consultationSettings.defaultSlotDuration,
      updatedAt: new Date()
    }).where(eq(doctors.id, input.id)).returning();

    await tx.update(users).set({
      branchId: input.branchId,
      departmentId: input.departmentId,
      name: input.displayName,
      email: input.email,
      phone: input.phone,
      isActive: input.isActive,
      updatedAt: new Date(),
      ...(input.passwordHash ? { passwordHash: input.passwordHash } : {})
    }).where(eq(users.id, existing[0].userId));

    await upsertDoctorConsultationSettings(input.id, input.consultationSettings, tx);
    const schedules = await upsertDoctorSchedules(input.id, input.schedules, input.updatedBy, tx);
    const today = new Date().toISOString().slice(0, 10);
    await deleteFutureAvailableSlots(input.id, today, tx);
    const existingKeys = new Set<string>();
    const slotDoctor = {
      ...doctor,
      branchName: null,
      departmentName: null,
      specialtyName: null,
      displayName: doctor.displayName ?? `${doctor.firstName} ${doctor.lastName}`.trim(),
      slotCount: 0,
      bookedSlotCount: 0
    };
    const slots = buildDoctorSlots({ doctor: slotDoctor, schedules, existingSlotKeys: existingKeys, days: 30 });
    await createDoctorSlots(slots, tx);
    return { doctor, schedules };
  });
}

export async function deleteDoctor(id: string) {
  return db.transaction(async (tx) => {
    const [doctor] = await tx.select().from(doctors).where(eq(doctors.id, id)).limit(1);
    if (!doctor) throw new Error("Doctor not found.");

    await tx.delete(doctorAppointmentSlots).where(and(eq(doctorAppointmentSlots.doctorId, id), ne(doctorAppointmentSlots.status, "booked")));
    await tx.delete(doctorSchedules).where(eq(doctorSchedules.doctorId, id));
    await tx.delete(doctorConsultationSettings).where(eq(doctorConsultationSettings.doctorId, id));
    await tx.update(doctors).set({ isActive: false, isAvailable: false, updatedAt: new Date() }).where(eq(doctors.id, id));
    await tx.update(users).set({ isActive: false, updatedAt: new Date() }).where(eq(users.id, doctor.userId));
    return doctor;
  });
}

export async function toggleDoctorStatus(id: string) {
  return db.transaction(async (tx) => {
    const [doctor] = await tx.select().from(doctors).where(eq(doctors.id, id)).limit(1);
    if (!doctor) throw new Error("Doctor not found.");
    const nextActive = !doctor.isActive;
    const [updated] = await tx.update(doctors).set({ isActive: nextActive, isAvailable: nextActive ? doctor.isAvailable : false, updatedAt: new Date() }).where(eq(doctors.id, id)).returning();
    await tx.update(users).set({ isActive: nextActive, updatedAt: new Date() }).where(eq(users.id, doctor.userId));
    return updated;
  });
}

export async function getDoctorDetails(id: string) {
  const doctor = await getDoctorById(id);
  if (!doctor) return null;
  const today = new Date().toISOString().slice(0, 10);
  const [schedules, consultationSettings, slots] = await Promise.all([
    getDoctorSchedules(id),
    getDoctorConsultationSettings(id),
    getDoctorSlots(id, today)
  ]);
  return { ...doctor, schedules, consultationSettings, slots };
}

export async function listExistingSlotKeys(doctorId: string, dates: string[]) {
  if (dates.length === 0) return new Set<string>();
  const rows = await db
    .select({
      slotDate: doctorAppointmentSlots.slotDate,
      startTime: doctorAppointmentSlots.startTime,
      endTime: doctorAppointmentSlots.endTime
    })
    .from(doctorAppointmentSlots)
    .where(and(eq(doctorAppointmentSlots.doctorId, doctorId), inArray(doctorAppointmentSlots.slotDate, dates)));
  return new Set(rows.map((slot) => `${slot.slotDate}|${slot.startTime}|${slot.endTime}`));
}
