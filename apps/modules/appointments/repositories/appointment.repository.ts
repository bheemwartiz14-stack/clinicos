import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { appointmentQueueEntries, appointments, doctors, patients, users } from "@mediclinic/db";
import type { AppointmentCreateInput } from "../validations/appointment.validation";

export type AppointmentStatus = "scheduled" | "checked_in" | "in_room" | "completed" | "cancelled" | "no_show";

export async function listUpcomingAppointments(branchId: string) {
  return db
    .select()
    .from(appointments)
    .where(eq(appointments.branchId, branchId))
    .orderBy(asc(appointments.startsAt))
    .limit(75);
}

export async function listAppointmentWorkspace(branchId: string, range?: { from?: Date; to?: Date }) {
  const conditions = [eq(appointments.branchId, branchId)];
  if (range?.from) conditions.push(gte(appointments.startsAt, range.from));
  if (range?.to) conditions.push(lte(appointments.startsAt, range.to));

  return db
    .select({
      id: appointments.id,
      branchId: appointments.branchId,
      patientId: appointments.patientId,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      patientMrn: patients.mrn,
      doctorId: appointments.doctorId,
      doctorFirstName: doctors.firstName,
      doctorLastName: doctors.lastName,
      doctorSpecialization: doctors.specialization,
      status: appointments.status,
      mode: appointments.mode,
      consultationMode: appointments.consultationMode,
      locationType: appointments.locationType,
      startsAt: appointments.startsAt,
      endsAt: appointments.endsAt,
      reason: appointments.reason,
      notes: appointments.notes,
      queueToken: appointments.queueToken,
      queuePriority: appointments.queuePriority,
      checkedInAt: appointments.checkedInAt,
      googleCalendarEventId: appointments.googleCalendarEventId,
      googleMeetLink: appointments.googleMeetLink,
      meetingUrl: appointments.meetingUrl,
      aiIntakeSummary: appointments.aiIntakeSummary,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt
    })
    .from(appointments)
    .innerJoin(patients, eq(patients.id, appointments.patientId))
    .innerJoin(doctors, eq(doctors.id, appointments.doctorId))
    .where(and(...conditions))
    .orderBy(asc(appointments.startsAt))
    .limit(200);
}

export async function listQueueEntries(branchId: string) {
  return db
    .select({
      id: appointmentQueueEntries.id,
      token: appointmentQueueEntries.token,
      priority: appointmentQueueEntries.priority,
      status: appointmentQueueEntries.status,
      checkedInAt: appointmentQueueEntries.checkedInAt,
      calledAt: appointmentQueueEntries.calledAt,
      completedAt: appointmentQueueEntries.completedAt,
      appointmentId: appointmentQueueEntries.appointmentId,
      patientFirstName: patients.firstName,
      patientLastName: patients.lastName,
      doctorFirstName: doctors.firstName,
      doctorLastName: doctors.lastName
    })
    .from(appointmentQueueEntries)
    .innerJoin(patients, eq(patients.id, appointmentQueueEntries.patientId))
    .innerJoin(doctors, eq(doctors.id, appointmentQueueEntries.doctorId))
    .where(eq(appointmentQueueEntries.branchId, branchId))
    .orderBy(asc(appointmentQueueEntries.checkedInAt))
    .limit(75);
}

export async function listBookingPatients(branchId: string) {
  return db
    .select({
      id: patients.id,
      label: sql<string>`${patients.firstName} || ' ' || ${patients.lastName} || ' (' || ${patients.mrn} || ')'`
    })
    .from(patients)
    .where(eq(patients.branchId, branchId))
    .orderBy(asc(patients.lastName), asc(patients.firstName))
    .limit(100);
}

export async function listBookingDoctors(branchId: string) {
  return db
    .select({
      id: doctors.id,
      label: sql<string>`${doctors.firstName} || ' ' || ${doctors.lastName} || ' - ' || ${doctors.specialization}`,
      visitDurationMinutes: doctors.visitDurationMinutes
    })
    .from(doctors)
    .innerJoin(users, eq(users.id, doctors.userId))
    .where(and(eq(doctors.branchId, branchId), eq(users.isActive, true)))
    .orderBy(asc(doctors.lastName), asc(doctors.firstName))
    .limit(100);
}

export async function createAppointment(branchId: string, input: AppointmentCreateInput) {
  const [appointment] = await db
    .insert(appointments)
    .values({
      branchId,
      patientId: input.patientId,
      doctorId: input.doctorId,
      mode: input.mode,
      consultationMode: input.consultationMode,
      locationType: input.locationType,
      roomId: input.roomId ?? null,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
      reason: input.reason,
      notes: input.notes,
      insuranceId: input.insuranceId ?? null,
      insuranceVerificationStatus: input.insuranceVerificationStatus,
      cptCodes: input.cptCodes,
      icd10Codes: input.icd10Codes,
      queuePriority: input.queuePriority
    } as any)
    .returning();

  return appointment;
}

export async function checkInAppointment(branchId: string, appointmentId: string, priority: "routine" | "priority" | "emergency" = "routine") {
  const token = `Q${Date.now().toString().slice(-5)}`;
  const [appointment] = await db
    .update(appointments)
    .set({
      status: "checked_in",
      checkedInAt: new Date(),
      queueToken: token,
      queuePriority: priority,
      updatedAt: new Date()
    } as any)
    .where(eq(appointments.id, appointmentId))
    .returning();

  if (!appointment) {
    throw new Error("Appointment not found.");
  }

  const [entry] = await db
    .insert(appointmentQueueEntries)
    .values({
      branchId,
      appointmentId,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      token,
      priority,
      status: "waiting"
    } as any)
    .onConflictDoNothing()
    .returning();

  return entry ?? null;
}

export async function updateAppointmentStatus(branchId: string, appointmentId: string, status: AppointmentStatus) {
  const patch: Record<string, unknown> = { status, updatedAt: new Date() };
  if (status === "checked_in") patch.checkedInAt = new Date();

  const [appointment] = await db
    .update(appointments)
    .set(patch as any)
    .where(and(eq(appointments.id, appointmentId), eq(appointments.branchId, branchId)))
    .returning();

  if (!appointment) throw new Error("Appointment not found.");
  return appointment;
}

export async function rescheduleAppointment(branchId: string, appointmentId: string, startsAt: Date, endsAt: Date) {
  const [appointment] = await db
    .update(appointments)
    .set({ startsAt, endsAt, updatedAt: new Date() } as any)
    .where(and(eq(appointments.id, appointmentId), eq(appointments.branchId, branchId)))
    .returning();

  if (!appointment) throw new Error("Appointment not found.");
  return appointment;
}

export async function attachGoogleCalendarEvent(appointmentId: string, data: { eventId: string; meetLink?: string | null }) {
  const [appointment] = await db
    .update(appointments)
    .set({
      googleCalendarEventId: data.eventId,
      googleMeetLink: data.meetLink ?? null,
      updatedAt: new Date()
    } as any)
    .where(eq(appointments.id, appointmentId))
    .returning();

  return appointment;
}
