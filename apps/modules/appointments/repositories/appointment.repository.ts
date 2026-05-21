import { and, asc, count, desc, eq, gt, gte, lt, lte, ne, notInArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  appointmentAiPredictions,
  appointmentCalendarEvents,
  appointmentCancellations,
  appointmentMeetSessions,
  appointmentNotes,
  appointmentQueueEntries,
  appointmentQueueTokens,
  appointments,
  appointmentReschedules,
  appointmentStatusHistory,
  doctors,
  patients,
  users
} from "@mediclinic/db";
import type { AppointmentCreateInput } from "../validations/appointment.validation";

export type AppointmentStatus = "scheduled" | "pending" | "confirmed" | "checked_in" | "in_room" | "in_consultation" | "completed" | "cancelled" | "no_show" | "rescheduled";

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
      patientPhone: patients.phone,
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

export async function getAppointmentDetail(branchId: string, appointmentId: string) {
  const [appointment] = await listAppointmentWorkspace(branchId).then((items) => items.filter((item) => item.id === appointmentId));
  if (!appointment) return null;
  const [timeline, notes, prediction] = await Promise.all([
    db
      .select()
      .from(appointmentStatusHistory)
      .where(eq(appointmentStatusHistory.appointmentId, appointmentId))
      .orderBy(desc(appointmentStatusHistory.changedAt)),
    db
      .select()
      .from(appointmentNotes)
      .where(eq(appointmentNotes.appointmentId, appointmentId))
      .orderBy(desc(appointmentNotes.createdAt)),
    db
      .select()
      .from(appointmentAiPredictions)
      .where(eq(appointmentAiPredictions.appointmentId, appointmentId))
      .limit(1)
  ]);
  return { appointment, timeline, notes, prediction: prediction[0] ?? null };
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
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);
  const appointmentNumber = `APT-${Date.now().toString(36).toUpperCase()}`;
  const [appointment] = await db
    .insert(appointments)
    .values({
      appointmentNumber,
      branchId,
      patientId: input.patientId,
      doctorId: input.doctorId,
      appointmentType: input.appointmentType,
      priority: input.queuePriority,
      mode: input.mode,
      consultationMode: input.consultationMode,
      locationType: input.locationType,
      roomId: input.roomId ?? null,
      roomNumber: input.roomNumber ?? null,
      location: input.location ?? null,
      appointmentDate: startsAt.toISOString().slice(0, 10),
      startTime: startsAt.toTimeString().slice(0, 5),
      endTime: endsAt.toTimeString().slice(0, 5),
      startsAt,
      endsAt,
      reason: input.reason,
      visitReason: input.reason,
      symptoms: input.symptoms ?? null,
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

export async function findOverlappingAppointment(branchId: string, doctorId: string, startsAt: Date, endsAt: Date, exceptAppointmentId?: string) {
  const conditions = [
    eq(appointments.branchId, branchId),
    eq(appointments.doctorId, doctorId),
    lt(appointments.startsAt, endsAt),
    gt(appointments.endsAt, startsAt),
    notInArray(appointments.status, ["cancelled", "no_show", "rescheduled"] as AppointmentStatus[])
  ];
  if (exceptAppointmentId) conditions.push(ne(appointments.id, exceptAppointmentId));
  const [appointment] = await db.select({ id: appointments.id }).from(appointments).where(and(...conditions)).limit(1);
  return appointment ?? null;
}

export async function checkInAppointment(branchId: string, appointmentId: string, priority: "routine" | "priority" | "emergency" = "routine") {
  const token = `Q${Date.now().toString().slice(-5)}`;
  const [queueCount] = await db.select({ total: count() }).from(appointmentQueueEntries).where(eq(appointmentQueueEntries.branchId, branchId));
  const queuePosition = (queueCount?.total ?? 0) + 1;
  const [appointment] = await db
    .update(appointments)
    .set({
      status: "checked_in",
      checkedInAt: new Date(),
      queueToken: token,
      tokenNumber: token,
      queuePriority: priority,
      priority,
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

  await db.insert(appointmentQueueTokens).values({
    branchId,
    appointmentId,
    patientId: appointment.patientId,
    doctorId: appointment.doctorId,
    tokenNumber: token,
    queuePosition,
    estimatedWaitMinutes: Math.max(0, (queuePosition - 1) * 15),
    queueStatus: "waiting",
    priority
  } as any).onConflictDoNothing();

  return entry ?? null;
}

export async function updateAppointmentStatus(branchId: string, appointmentId: string, status: AppointmentStatus, options?: { changedByUserId?: string; reason?: string }) {
  const [current] = await db.select({ status: appointments.status }).from(appointments).where(and(eq(appointments.id, appointmentId), eq(appointments.branchId, branchId))).limit(1);
  if (!current) throw new Error("Appointment not found.");
  const patch: Record<string, unknown> = { status, updatedAt: new Date() };
  if (status === "checked_in") patch.checkedInAt = new Date();
  if (status === "completed") patch.completedAt = new Date();
  if (status === "cancelled") patch.cancelledAt = new Date();

  const [appointment] = await db
    .update(appointments)
    .set(patch as any)
    .where(and(eq(appointments.id, appointmentId), eq(appointments.branchId, branchId)))
    .returning();

  if (!appointment) throw new Error("Appointment not found.");
  await db.insert(appointmentStatusHistory).values({
    appointmentId,
    oldStatus: current.status,
    newStatus: status,
    changedByUserId: options?.changedByUserId ?? null,
    reason: options?.reason ?? null
  } as any);
  return appointment;
}

export async function rescheduleAppointment(branchId: string, appointmentId: string, startsAt: Date, endsAt: Date, options?: { changedByUserId?: string; reason?: string; notifyPatient?: boolean }) {
  const [current] = await db.select().from(appointments).where(and(eq(appointments.id, appointmentId), eq(appointments.branchId, branchId))).limit(1);
  if (!current) throw new Error("Appointment not found.");
  const [appointment] = await db
    .update(appointments)
    .set({
      startsAt,
      endsAt,
      appointmentDate: startsAt.toISOString().slice(0, 10),
      startTime: startsAt.toTimeString().slice(0, 5),
      endTime: endsAt.toTimeString().slice(0, 5),
      status: "rescheduled",
      updatedAt: new Date()
    } as any)
    .where(and(eq(appointments.id, appointmentId), eq(appointments.branchId, branchId)))
    .returning();

  if (!appointment) throw new Error("Appointment not found.");
  await db.insert(appointmentReschedules).values({
    appointmentId,
    oldStartsAt: current.startsAt,
    oldEndsAt: current.endsAt,
    newStartsAt: startsAt,
    newEndsAt: endsAt,
    reason: options?.reason ?? "Schedule change",
    changedByUserId: options?.changedByUserId ?? null,
    notifyPatient: options?.notifyPatient ?? true
  } as any);
  return appointment;
}

export async function cancelAppointment(branchId: string, appointmentId: string, input: { reason: string; cancelledByUserId?: string; notifyPatient?: boolean }) {
  const appointment = await updateAppointmentStatus(branchId, appointmentId, "cancelled", { changedByUserId: input.cancelledByUserId, reason: input.reason });
  await db.insert(appointmentCancellations).values({
    appointmentId,
    reason: input.reason,
    cancelledByUserId: input.cancelledByUserId ?? null,
    notifyPatient: input.notifyPatient ?? true
  } as any);
  return appointment;
}

export async function updateQueueStatus(appointmentId: string, queueStatus: "waiting" | "called" | "in_consultation" | "skipped" | "completed") {
  const patch: Record<string, unknown> = { queueStatus, updatedAt: new Date() };
  if (queueStatus === "called") patch.calledAt = new Date();
  if (queueStatus === "completed") patch.completedAt = new Date();
  await db.update(appointmentQueueTokens).set(patch as any).where(eq(appointmentQueueTokens.appointmentId, appointmentId));
  await db.update(appointmentQueueEntries).set({ status: queueStatus, updatedAt: new Date() } as any).where(eq(appointmentQueueEntries.appointmentId, appointmentId));
}

export async function saveAiPrediction(appointmentId: string, data: { score: number; level: string; recommendedReminderFrequency: string; signals?: Record<string, unknown> }) {
  await db.insert(appointmentAiPredictions).values({
    appointmentId,
    noShowRiskScore: String(data.score),
    riskLevel: data.level,
    recommendedReminderFrequency: data.recommendedReminderFrequency,
    signals: data.signals ?? {}
  } as any).onConflictDoNothing();
}

export async function saveCalendarEvent(input: { appointmentId: string; doctorId: string; providerEventId: string; eventUrl?: string | null }) {
  await db.insert(appointmentCalendarEvents).values({
    appointmentId: input.appointmentId,
    doctorId: input.doctorId,
    providerEventId: input.providerEventId,
    eventUrl: input.eventUrl ?? null,
    syncedAt: new Date(),
    syncStatus: "synced"
  } as any).onConflictDoNothing();
}

export async function saveMeetSession(input: { appointmentId: string; doctorId: string; meetingUrl: string; providerEventId?: string | null; startsAt: Date; endsAt: Date }) {
  await db.insert(appointmentMeetSessions).values(input as any).onConflictDoNothing();
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
