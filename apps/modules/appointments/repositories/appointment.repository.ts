import { and, asc, eq, gt, ilike, inArray, lt, ne, notInArray, or, sql } from "drizzle-orm";
import { appointments, branches, db, doctors, patients, users } from "@mediclinic/db";
import type {
  AppointmentCancelInput,
  AppointmentFormInput,
  AppointmentStatus,
  AppointmentStatusUpdateInput,
  AppointmentType,
  AppointmentUpdateInput,
  QuickPatientCreateInput
} from "../schemas/appointment.schema";

function dateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function endTime(startTime: string, durationMinutes: number) {
  const start = dateTime("2000-01-01", startTime);
  return new Date(start.getTime() + durationMinutes * 60_000).toTimeString().slice(0, 5);
}

function appointmentTypeFor(type: AppointmentType) {
  if (type === "follow_up") return "follow_up";
  if (type === "emergency") return "emergency";
  return "consultation";
}

function modeFor(type: AppointmentType) {
  return type === "online" ? "online" : "offline";
}

export async function getAppointmentsByDate(branchId: string, selectedDate: string) {
  return db
    .select({
      id: appointments.id,
      bookingNumber: sql<string>`coalesce(${appointments.bookingNumber}, ${appointments.appointmentNumber}, '')`,
      patientId: appointments.patientId,
      patientName: sql<string>`coalesce(${patients.fullName}, ${patients.firstName} || ' ' || ${patients.lastName})`,
      patientMeta: sql<string>`coalesce(${patients.phone}, '')`,
      patientPhone: patients.phone,
      doctorId: appointments.doctorId,
      doctorName: sql<string>`coalesce(${doctors.displayName}, ${doctors.firstName} || ' ' || ${doctors.lastName})`,
      doctorSpecialty: sql<string>`coalesce((select name from departments specialty where specialty.id = ${doctors.specialtyId}), ${doctors.specialization}, 'General Physician')`,
      appointmentDate: appointments.appointmentDate,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      durationMinutes: appointments.durationMinutes,
      type: appointments.type,
      status: appointments.status,
      reasonForVisit: sql<string>`coalesce(${appointments.reasonForVisit}, ${appointments.reason})`,
      notes: appointments.notes,
      createdByName: users.name,
      cancelledReason: appointments.cancelledReason,
      meetingUrl: appointments.meetingUrl,
      googleMeetLink: appointments.googleMeetLink
    })
    .from(appointments)
    .innerJoin(patients, eq(patients.id, appointments.patientId))
    .innerJoin(doctors, eq(doctors.id, appointments.doctorId))
    .leftJoin(users, eq(users.id, appointments.createdBy))
    .where(and(eq(appointments.branchId, branchId), eq(appointments.appointmentDate, selectedDate)))
    .orderBy(asc(appointments.startTime));
}

export async function getAppointmentById(branchId: string, id: string) {
  const [appointment] = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.branchId, branchId), eq(appointments.id, id)))
    .limit(1);
  return appointment ?? null;
}

export async function createAppointment(branchId: string, input: AppointmentFormInput & { bookingNumber: string; userId: string }) {
  const startsAt = dateTime(input.appointmentDate, input.startTime);
  const end = endTime(input.startTime, input.durationMinutes);
  const endsAt = dateTime(input.appointmentDate, end);
  const mode = modeFor(input.type);
  const [appointment] = await db
    .insert(appointments)
    .values({
      bookingNumber: input.bookingNumber,
      appointmentNumber: input.bookingNumber,
      branchId,
      patientId: input.patientId,
      doctorId: input.doctorId,
      bookedByUserId: input.userId,
      createdBy: input.userId,
      updatedBy: input.userId,
      status: input.status,
      type: input.type,
      appointmentType: appointmentTypeFor(input.type),
      mode,
      consultationMode: mode,
      locationType: mode === "online" ? "online" : "clinic",
      appointmentDate: input.appointmentDate,
      startTime: input.startTime,
      endTime: end,
      durationMinutes: input.durationMinutes,
      startsAt,
      endsAt,
      reason: input.reasonForVisit,
      reasonForVisit: input.reasonForVisit,
      visitReason: input.reasonForVisit,
      notes: input.notes
    })
    .returning();
  return appointment;
}

export async function updateAppointment(branchId: string, input: AppointmentUpdateInput & { userId: string }) {
  const end = endTime(input.startTime, input.durationMinutes);
  const mode = modeFor(input.type);
  const [appointment] = await db
    .update(appointments)
    .set({
      patientId: input.patientId,
      doctorId: input.doctorId,
      status: input.status,
      type: input.type,
      appointmentType: appointmentTypeFor(input.type),
      mode,
      consultationMode: mode,
      locationType: mode === "online" ? "online" : "clinic",
      appointmentDate: input.appointmentDate,
      startTime: input.startTime,
      endTime: end,
      durationMinutes: input.durationMinutes,
      startsAt: dateTime(input.appointmentDate, input.startTime),
      endsAt: dateTime(input.appointmentDate, end),
      reason: input.reasonForVisit,
      reasonForVisit: input.reasonForVisit,
      visitReason: input.reasonForVisit,
      notes: input.notes,
      updatedBy: input.userId,
      updatedAt: new Date()
    })
    .where(and(eq(appointments.branchId, branchId), eq(appointments.id, input.id)))
    .returning();
  return appointment;
}

export async function cancelAppointment(branchId: string, input: AppointmentCancelInput & { userId: string }) {
  const [appointment] = await db
    .update(appointments)
    .set({
      status: "cancelled",
      cancelledReason: input.cancelledReason,
      cancelledAt: new Date(),
      updatedBy: input.userId,
      updatedAt: new Date()
    })
    .where(and(eq(appointments.branchId, branchId), eq(appointments.id, input.id)))
    .returning();
  return appointment;
}

export async function updateAppointmentStatus(branchId: string, input: AppointmentStatusUpdateInput & { userId: string }) {
  const patch: {
    status: AppointmentStatus;
    updatedBy: string;
    updatedAt: Date;
    checkedInAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
  } = { status: input.status, updatedBy: input.userId, updatedAt: new Date() };
  if (input.status === "checked_in") patch.checkedInAt = new Date();
  if (input.status === "completed") patch.completedAt = new Date();
  if (input.status === "cancelled") patch.cancelledAt = new Date();

  const [appointment] = await db
    .update(appointments)
    .set(patch)
    .where(and(eq(appointments.branchId, branchId), eq(appointments.id, input.id)))
    .returning();
  return appointment;
}

export async function checkAppointmentConflict(params: {
  branchId: string;
  patientId: string;
  doctorId: string;
  startsAt: Date;
  endsAt: Date;
  excludeAppointmentId?: string;
}) {
  const conditions = [
    eq(appointments.branchId, params.branchId),
    lt(appointments.startsAt, params.endsAt),
    gt(appointments.endsAt, params.startsAt),
    notInArray(appointments.status, ["cancelled", "no_show", "completed"])
  ];
  if (params.excludeAppointmentId) conditions.push(ne(appointments.id, params.excludeAppointmentId));

  const [doctorConflict] = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(and(...conditions, eq(appointments.doctorId, params.doctorId), inArray(appointments.status, ["confirmed", "checked_in"])))
    .limit(1);

  const [patientConflict] = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(and(...conditions, eq(appointments.patientId, params.patientId), inArray(appointments.status, ["confirmed", "checked_in"])))
    .limit(1);

  return { doctorConflict: doctorConflict ?? null, patientConflict: patientConflict ?? null };
}

export async function getActiveDoctorsForBooking(branchId: string) {
  return db
    .select({
      id: doctors.id,
      displayName: sql<string>`coalesce(${doctors.displayName}, ${doctors.firstName} || ' ' || ${doctors.lastName})`,
      specialty: sql<string>`coalesce((select name from departments specialty where specialty.id = ${doctors.specialtyId}), ${doctors.specialization}, 'General Physician')`,
      defaultDuration: doctors.visitDurationMinutes
    })
    .from(doctors)
    .innerJoin(users, eq(users.id, doctors.userId))
    .where(and(eq(doctors.branchId, branchId), eq(doctors.isActive, true), eq(doctors.isAvailable, true), eq(users.isActive, true)))
    .orderBy(asc(doctors.displayName), asc(doctors.firstName));
}

export async function getPatientsForBooking(branchId: string, search?: string) {
  const conditions = [eq(patients.branchId, branchId), eq(patients.isActive, true)];
  if (search) {
    conditions.push(or(ilike(patients.fullName, `%${search}%`), ilike(patients.phone, `%${search}%`), ilike(patients.email, `%${search}%`)) as typeof conditions[number]);
  }
  return db
    .select({
      id: patients.id,
      fullName: sql<string>`coalesce(${patients.fullName}, ${patients.firstName} || ' ' || ${patients.lastName})`,
      phone: patients.phone,
      email: patients.email,
      mrn: patients.mrn
    })
    .from(patients)
    .where(and(...conditions))
    .orderBy(asc(patients.fullName), asc(patients.firstName))
    .limit(200);
}

export async function quickCreatePatient(branchId: string, input: QuickPatientCreateInput & { createdByUserId: string }) {
  const names = input.fullName.trim().split(/\s+/);
  const firstName = names[0] ?? input.fullName;
  const lastName = names.slice(1).join(" ") || "Patient";
  const [branchPatients] = await db.select({ total: sql<number>`count(*)::int` }).from(patients).where(eq(patients.branchId, branchId));
  const mrn = `PT-${String((branchPatients?.total ?? 0) + 1).padStart(5, "0")}`;
  const [patient] = await db
    .insert(patients)
    .values({
      branchId,
      mrn,
      firstName,
      lastName,
      fullName: input.fullName,
      email: input.email,
      dateOfBirth: input.dateOfBirth,
      gender: input.gender,
      bloodGroup: input.bloodGroup,
      maritalStatus: input.maritalStatus,
      phone: input.phone,
      createdByUserId: input.createdByUserId,
      updatedByUserId: input.createdByUserId
    })
    .returning();
  return patient;
}

export async function getBranchById(branchId: string) {
  const [branch] = await db.select().from(branches).where(eq(branches.id, branchId)).limit(1);
  return branch ?? null;
}
