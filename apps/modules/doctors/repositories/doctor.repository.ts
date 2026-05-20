import { count, eq, and, gte, lte, inArray, sql, desc } from "drizzle-orm";
import {
  appointments,
  branches,
  db,
  departments,
  doctors,
  doctorAppointmentSlots,
  doctorBreaks,
  doctorLeaveBlocks,
  doctorSchedules,
  doctorVisitSettings,
  doctorCalendarConnections,
  doctorCalendarBusyEvents,
  doctorCalendarSyncLogs,
  users
} from "@mediclinic/db";
import type {
  DoctorProfile,
  DoctorSchedule,
  DoctorBreak,
  DoctorLeaveBlock,
  DoctorVisitSettings,
  DoctorAppointmentSlot,
  DoctorWithDetails,
  DoctorFilterInput
} from "../types/doctor.types";

export async function listDoctors(filter?: DoctorFilterInput) {
  const conditions = [];

  if (filter?.branchId) {
    conditions.push(eq(doctors.branchId, filter.branchId));
  }
  if (filter?.departmentId) {
    conditions.push(eq(doctors.departmentId, filter.departmentId));
  }
  if (filter?.isActive !== undefined) {
    conditions.push(eq(users.isActive, filter.isActive));
  }
  if (filter?.search) {
    conditions.push(
      sql`(${users.name} ILIKE ${`%${filter.search}%`} OR ${doctors.email} ILIKE ${`%${filter.search}%`} OR ${doctors.specialization} ILIKE ${`%${filter.search}%`})`
    );
  }

  const rows = await db
    .select({
      id: doctors.id,
      userId: doctors.userId,
      branchId: doctors.branchId,
      branchName: branches.name,
      departmentId: doctors.departmentId,
      departmentName: departments.name,
      name: users.name,
      firstName: doctors.firstName,
      lastName: doctors.lastName,
      email: doctors.email,
      phone: doctors.phone,
      gender: doctors.gender,
      dateOfBirth: doctors.dateOfBirth,
      specialization: doctors.specialization,
      qualification: doctors.qualification,
      experienceYears: doctors.experienceYears,
      licenseNumber: doctors.licenseNumber,
      npi: doctors.npi,
      consultationFee: doctors.consultationFee,
      bio: doctors.bio,
      isActive: users.isActive,
      visitDurationMinutes: doctors.visitDurationMinutes,
      createdAt: doctors.createdAt,
      updatedAt: doctors.updatedAt
    })
    .from(doctors)
    .innerJoin(users, eq(users.id, doctors.userId))
    .leftJoin(branches, eq(branches.id, doctors.branchId))
    .leftJoin(departments, eq(departments.id, doctors.departmentId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(users.name);

  return rows;
}

export async function getDoctorById(id: string): Promise<DoctorProfile | null> {
  const [row] = await db
    .select({
      id: doctors.id,
      userId: doctors.userId,
      branchId: doctors.branchId,
      branchName: branches.name,
      departmentId: doctors.departmentId,
      departmentName: departments.name,
      name: users.name,
      firstName: doctors.firstName,
      lastName: doctors.lastName,
      email: doctors.email,
      phone: doctors.phone,
      gender: doctors.gender,
      dateOfBirth: doctors.dateOfBirth,
      specialization: doctors.specialization,
      qualification: doctors.qualification,
      experienceYears: doctors.experienceYears,
      licenseNumber: doctors.licenseNumber,
      npi: doctors.npi,
      consultationFee: doctors.consultationFee,
      bio: doctors.bio,
      isActive: users.isActive,
      visitDurationMinutes: doctors.visitDurationMinutes,
      createdAt: doctors.createdAt,
      updatedAt: doctors.updatedAt
    })
    .from(doctors)
    .innerJoin(users, eq(users.id, doctors.userId))
    .leftJoin(branches, eq(branches.id, doctors.branchId))
    .leftJoin(departments, eq(departments.id, doctors.departmentId))
    .where(eq(doctors.id, id))
    .limit(1);

  return row || null;
}

export async function getDoctorWithDetails(id: string): Promise<DoctorWithDetails | null> {
  const doctor = await getDoctorById(id);
  if (!doctor) return null;

  const [schedules, breaks, leaveBlocks, visitSettings] = await Promise.all([
    getDoctorSchedules(id),
    getDoctorBreaks(id),
    getDoctorLeaveBlocks(id),
    getDoctorVisitSettings(id)
  ]);

  return {
    ...doctor,
    schedules,
    breaks,
    leaveBlocks,
    visitSettings
  };
}

export async function getDoctorByUserId(userId: string): Promise<DoctorProfile | null> {
  const [row] = await db
    .select({
      id: doctors.id,
      userId: doctors.userId,
      branchId: doctors.branchId,
      branchName: branches.name,
      departmentId: doctors.departmentId,
      departmentName: departments.name,
      name: users.name,
      firstName: doctors.firstName,
      lastName: doctors.lastName,
      email: doctors.email,
      phone: doctors.phone,
      gender: doctors.gender,
      dateOfBirth: doctors.dateOfBirth,
      specialization: doctors.specialization,
      qualification: doctors.qualification,
      experienceYears: doctors.experienceYears,
      licenseNumber: doctors.licenseNumber,
      npi: doctors.npi,
      consultationFee: doctors.consultationFee,
      bio: doctors.bio,
      isActive: users.isActive,
      visitDurationMinutes: doctors.visitDurationMinutes,
      createdAt: doctors.createdAt,
      updatedAt: doctors.updatedAt
    })
    .from(doctors)
    .innerJoin(users, eq(users.id, doctors.userId))
    .leftJoin(branches, eq(branches.id, doctors.branchId))
    .leftJoin(departments, eq(departments.id, doctors.departmentId))
    .where(eq(doctors.userId, userId))
    .limit(1);

  return row || null;
}

export async function createDoctor(data: {
  userId: string;
  branchId: string;
  departmentId?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: Date | null;
  specialization: string;
  qualification?: string | null;
  experienceYears?: number;
  npi?: string | null;
  licenseNumber: string;
  consultationFee: number;
  bio?: string | null;
  isActive?: boolean;
  visitDurationMinutes?: number;
}) {
  const [doctor] = await db
    .insert(doctors)
    .values({
      userId: data.userId as never,
      branchId: data.branchId as never,
      departmentId: data.departmentId as never,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone as never,
      gender: data.gender as never,
      dateOfBirth: data.dateOfBirth as never,
      specialization: data.specialization,
      qualification: data.qualification as never,
      experienceYears: data.experienceYears ?? 0,
      npi: data.npi as never,
      licenseNumber: data.licenseNumber,
      consultationFee: data.consultationFee,
      bio: data.bio as never,
      isActive: data.isActive ?? true,
      visitDurationMinutes: data.visitDurationMinutes ?? 20
    } as any)
    .returning();

  await db.insert(doctorVisitSettings).values({
    doctorId: doctor.id,
    visitDurationMinutes: data.visitDurationMinutes ?? 20,
    bufferTimeMinutes: 5,
    maxPatientsPerDay: 20,
    autoGenerateSlots: true,
    allowOnlineConsultation: false
  });

  return doctor;
}

export async function updateDoctor(id: string, data: Partial<{
  branchId: string;
  departmentId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  gender: string | null;
  dateOfBirth: Date | null;
  specialization: string;
  qualification: string | null;
  experienceYears: number;
  npi: string | null;
  licenseNumber: string;
  consultationFee: number;
  bio: string | null;
  isActive: boolean;
  visitDurationMinutes: number;
}>) {
  const [doctor] = await db
    .update(doctors)
    .set(data as any)
    .where(eq(doctors.id, id))
    .returning();

  return doctor;
}

export async function deleteDoctor(id: string) {
  await db.delete(doctors).where(eq(doctors.id, id));
}

export async function getDoctorSchedules(doctorId: string): Promise<DoctorSchedule[]> {
  return db
    .select()
    .from(doctorSchedules)
    .where(eq(doctorSchedules.doctorId, doctorId))
    .orderBy(doctorSchedules.dayOfWeek) as Promise<DoctorSchedule[]>;
}

export async function upsertDoctorSchedules(doctorId: string, schedules: Array<{
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}>) {
  await db.delete(doctorSchedules).where(eq(doctorSchedules.doctorId, doctorId));

  if (schedules.length > 0) {
    await db.insert(doctorSchedules).values(
      schedules.map((s) => ({
        doctorId,
        dayOfWeek: s.dayOfWeek,
        isAvailable: s.isAvailable,
        startTime: s.startTime,
        endTime: s.endTime
      }))
    );
  }
}

export async function getDoctorBreaks(doctorId: string): Promise<DoctorBreak[]> {
  return db
    .select()
    .from(doctorBreaks)
    .where(eq(doctorBreaks.doctorId, doctorId)) as Promise<DoctorBreak[]>;
}

export async function upsertDoctorBreaks(doctorId: string, breaks: Array<{
  id?: string;
  breakType: string;
  breakName: string | null;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
}>) {
  await db.delete(doctorBreaks).where(eq(doctorBreaks.doctorId, doctorId));

  if (breaks.length > 0) {
    await db.insert(doctorBreaks).values(
      breaks.map((b) => ({
        doctorId,
        breakType: b.breakType,
        breakName: b.breakName,
        startTime: b.startTime,
        endTime: b.endTime,
        isEnabled: b.isEnabled
      }))
    );
  }
}

export async function getDoctorLeaveBlocks(doctorId: string): Promise<DoctorLeaveBlock[]> {
  return db
    .select()
    .from(doctorLeaveBlocks)
    .where(eq(doctorLeaveBlocks.doctorId, doctorId))
    .orderBy(desc(doctorLeaveBlocks.fromDate)) as Promise<DoctorLeaveBlock[]>;
}

export async function createDoctorLeaveBlock(data: {
  doctorId: string;
  leaveType: string;
  fromDate: Date;
  toDate: Date;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
}) {
  const [leave] = await db
    .insert(doctorLeaveBlocks)
    .values({
      doctorId: data.doctorId as never,
      leaveType: data.leaveType as never,
      fromDate: data.fromDate as never,
      toDate: data.toDate as never,
      startTime: data.startTime as never,
      endTime: data.endTime as never,
      reason: data.reason as never,
      status: "pending"
    } as any)
    .returning();

  return leave;
}

export async function updateDoctorLeaveBlock(id: string, data: Partial<{
  leaveType: string;
  fromDate: Date;
  toDate: Date;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
  status: string;
}>) {
  const [leave] = await db
    .update(doctorLeaveBlocks)
    .set(data as any)
    .where(eq(doctorLeaveBlocks.id, id))
    .returning();

  return leave;
}

export async function deleteDoctorLeaveBlock(id: string) {
  await db.delete(doctorLeaveBlocks).where(eq(doctorLeaveBlocks.id, id));
}

export async function getDoctorVisitSettings(doctorId: string): Promise<DoctorVisitSettings | null> {
  const [settings] = await db
    .select()
    .from(doctorVisitSettings)
    .where(eq(doctorVisitSettings.doctorId, doctorId))
    .limit(1);

  return settings || null;
}

export async function updateDoctorVisitSettings(doctorId: string, data: Partial<{
  visitDurationMinutes: number;
  bufferTimeMinutes: number;
  maxPatientsPerDay: number;
  autoGenerateSlots: boolean;
  allowOnlineConsultation: boolean;
  calendarSyncEnabled: boolean;
  calendarAccessToken: string;
  calendarRefreshToken: string;
  calendarTokenExpiry: Date;
}>) {
  const [settings] = await db
    .update(doctorVisitSettings)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(doctorVisitSettings.doctorId, doctorId))
    .returning();

  return settings;
}

export async function getDoctorSlots(doctorId: string, date: Date): Promise<DoctorAppointmentSlot[]> {
  const dateStr = date.toISOString().split("T")[0];
  return db
    .select()
    .from(doctorAppointmentSlots)
    .where(and(eq(doctorAppointmentSlots.doctorId, doctorId), eq(doctorAppointmentSlots.slotDate, dateStr)))
    .orderBy(doctorAppointmentSlots.startTime) as Promise<DoctorAppointmentSlot[]>;
}

export async function getDoctorSlotsInRange(doctorId: string, startDate: Date, endDate: Date): Promise<DoctorAppointmentSlot[]> {
  return db
    .select()
    .from(doctorAppointmentSlots)
    .where(and(
      eq(doctorAppointmentSlots.doctorId, doctorId),
      gte(doctorAppointmentSlots.slotDate, startDate.toISOString().split("T")[0]),
      lte(doctorAppointmentSlots.slotDate, endDate.toISOString().split("T")[0])
    ))
    .orderBy(doctorAppointmentSlots.slotDate, doctorAppointmentSlots.startTime) as Promise<DoctorAppointmentSlot[]>;
}

export async function deleteDoctorSlotsInRange(doctorId: string, startDate: Date, endDate: Date) {
  await db
    .delete(doctorAppointmentSlots)
    .where(and(
      eq(doctorAppointmentSlots.doctorId, doctorId),
      gte(doctorAppointmentSlots.slotDate, startDate.toISOString().split("T")[0]),
      lte(doctorAppointmentSlots.slotDate, endDate.toISOString().split("T")[0]),
      eq(doctorAppointmentSlots.status, "available")
    ));
}

export async function createDoctorSlots(slots: Array<{
  doctorId: string;
  slotDate: Date;
  startTime: string;
  endTime: string;
  status: string;
  appointmentId?: string;
}>) {
  if (slots.length === 0) return;
  
  await db.insert(doctorAppointmentSlots).values(
    slots.map((s) => ({
      doctorId: s.doctorId as never,
      slotDate: s.slotDate.toISOString().split("T")[0] as never,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status as never,
      appointmentId: s.appointmentId as never
    })) as any
  );
}

export async function getActiveDoctorsByBranch(branchId: string) {
  return db
    .select({
      id: doctors.id,
      firstName: doctors.firstName,
      lastName: doctors.lastName,
      email: doctors.email,
      specialization: doctors.specialization
    })
    .from(doctors)
    .innerJoin(users, and(eq(users.id, doctors.userId), eq(users.isActive, true)))
    .where(eq(doctors.branchId, branchId))
    .orderBy(doctors.lastName);
}

export async function getDoctorAppointmentCount(doctorId: string): Promise<number> {
  const [result] = await db
    .select({ total: count() })
    .from(appointments)
    .where(eq(appointments.doctorId, doctorId));
  return result?.total ?? 0;
}

export async function getDoctorByEmail(email: string) {
  const [doctor] = await db
    .select()
    .from(doctors)
    .where(eq(doctors.email, email.toLowerCase()))
    .limit(1);
  return doctor || null;
}

async function appointmentCount(doctorId: string) {
  const [result] = await db.select({ total: count() }).from(appointments).where(eq(appointments.doctorId, doctorId));
  return result?.total ?? 0;
}

export async function listDoctorsWithCounts() {
  const rows = await db
    .select({
      id: doctors.id,
      userId: doctors.userId,
      branchId: doctors.branchId,
      branchName: branches.name,
      departmentId: doctors.departmentId,
      departmentName: departments.name,
      name: users.name,
      email: doctors.email,
      phone: doctors.phone,
      isActive: users.isActive,
      specialty: doctors.specialization,
      licenseNumber: doctors.licenseNumber,
      npi: doctors.npi,
      experienceYears: doctors.experienceYears,
      consultationFee: doctors.consultationFee,
      visitDurationMinutes: doctors.visitDurationMinutes,
      updatedAt: doctors.updatedAt
    })
    .from(doctors)
    .innerJoin(users, eq(users.id, doctors.userId))
    .leftJoin(branches, eq(branches.id, doctors.branchId))
    .leftJoin(departments, eq(departments.id, doctors.departmentId))
    .where(eq(users.role, "doctor"))
    .orderBy(users.name);

  return Promise.all(
    rows.map(async (doctor) => ({
      ...doctor,
      appointmentCount: await appointmentCount(doctor.id)
    }))
  );
}

export async function getDoctorCalendarConnection(doctorId: string) {
  const [connection] = await db
    .select()
    .from(doctorCalendarConnections)
    .where(eq(doctorCalendarConnections.doctorId, doctorId))
    .limit(1);
  return connection || null;
}

export async function createCalendarConnection(data: {
  doctorId: string;
  userId: string;
  provider: string;
  providerAccountEmail: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  scope: string;
  expiryDate: Date;
  calendarId: string;
  isConnected: boolean;
  syncStatus: string;
  syncError: string | null;
}) {
  const [connection] = await db
    .insert(doctorCalendarConnections)
    .values({
      doctorId: data.doctorId as never,
      userId: data.userId as never,
      provider: data.provider as never,
      providerAccountEmail: data.providerAccountEmail,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tokenType: data.tokenType,
      scope: data.scope,
      expiryDate: data.expiryDate,
      calendarId: data.calendarId,
      isConnected: data.isConnected,
      syncStatus: data.syncStatus as never,
      syncError: data.syncError
    } as any)
    .returning();
  return connection;
}

export async function updateCalendarConnection(id: string, data: Partial<{
  provider: string;
  providerAccountEmail: string;
  accessToken: string;
  refreshToken: string | undefined;
  tokenType: string;
  scope: string;
  expiryDate: Date;
  calendarId: string;
  isConnected: boolean;
  syncStatus: string;
  lastSyncedAt: Date;
  syncError: string | null;
}>) {
  const [connection] = await db
    .update(doctorCalendarConnections)
    .set({ ...data, updatedAt: new Date() } as any)
    .where(eq(doctorCalendarConnections.id, id))
    .returning();
  return connection;
}

export async function deleteCalendarConnection(doctorId: string) {
  await db.delete(doctorCalendarConnections).where(eq(doctorCalendarConnections.doctorId, doctorId));
}

export async function getCalendarBusyEvents(doctorId: string, startDate: Date, endDate: Date) {
  return db
    .select()
    .from(doctorCalendarBusyEvents)
    .where(and(
      eq(doctorCalendarBusyEvents.doctorId, doctorId),
      gte(doctorCalendarBusyEvents.startAt, startDate),
      lte(doctorCalendarBusyEvents.endAt, endDate),
      eq(doctorCalendarBusyEvents.status, "busy")
    ))
    .orderBy(doctorCalendarBusyEvents.startAt) as Promise<any[]>;
}

export async function createCalendarBusyEvents(events: Array<{
  doctorId: string;
  connectionId: string;
  providerEventId: string;
  calendarId: string;
  title: string | null;
  startAt: Date;
  endAt: Date;
  isAllDay: boolean;
  status: string;
}>) {
  if (events.length === 0) return;
  await db.insert(doctorCalendarBusyEvents).values(
    events.map(e => ({
      doctorId: e.doctorId as never,
      connectionId: e.connectionId as never,
      providerEventId: e.providerEventId,
      calendarId: e.calendarId,
      title: e.title,
      startAt: e.startAt as never,
      endAt: e.endAt as never,
      isAllDay: e.isAllDay,
      status: e.status as never
    })) as any
  );
}

export async function deleteCalendarBusyEvents(connectionId: string) {
  await db.delete(doctorCalendarBusyEvents).where(eq(doctorCalendarBusyEvents.connectionId, connectionId));
}

export async function createCalendarSyncLog(data: {
  doctorId: string;
  connectionId: string;
  syncType: string;
  status: string;
  message?: string | null;
  startedAt: Date;
  completedAt?: Date | null;
}) {
  const [log] = await db
    .insert(doctorCalendarSyncLogs)
    .values({
      doctorId: data.doctorId as never,
      connectionId: data.connectionId as never,
      syncType: data.syncType as never,
      status: data.status as never,
      message: data.message,
      startedAt: data.startedAt as never,
      completedAt: data.completedAt as never
    } as any)
    .returning();
  return log;
}

export async function updateCalendarSyncLog(id: string, data: {
  status: string;
  message?: string | null;
  completedAt: Date;
}) {
  const [log] = await db
    .update(doctorCalendarSyncLogs)
    .set(data as any)
    .where(eq(doctorCalendarSyncLogs.id, id))
    .returning();
  return log;
}
