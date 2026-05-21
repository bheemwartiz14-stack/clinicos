import { and, asc, count, eq, gte, isNotNull, lt, sql } from "drizzle-orm";
import { appointments, db, doctors, invoices, patientNotes, patients, payments } from "@mediclinic/db";

type DateRange = {
  start: Date;
  end: Date;
};

async function countPatients(branchId: string, range?: DateRange) {
  const conditions = [eq(patients.branchId, branchId)];
  if (range) conditions.push(gte(patients.createdAt, range.start), lt(patients.createdAt, range.end));

  const [row] = await db.select({ total: count() }).from(patients).where(and(...conditions));
  return row?.total ?? 0;
}

async function countAppointments(branchId: string, range: DateRange) {
  const [row] = await db
    .select({ total: count() })
    .from(appointments)
    .where(and(eq(appointments.branchId, branchId), gte(appointments.startsAt, range.start), lt(appointments.startsAt, range.end)));

  return row?.total ?? 0;
}

async function countAiNotes(branchId: string, range: DateRange) {
  const [row] = await db
    .select({ total: count() })
    .from(appointments)
    .where(
      and(
        eq(appointments.branchId, branchId),
        isNotNull(appointments.aiIntakeSummary),
        gte(appointments.updatedAt, range.start),
        lt(appointments.updatedAt, range.end)
      )
    );

  return row?.total ?? 0;
}

async function countPatientNotes(branchId: string, range: DateRange) {
  const [row] = await db
    .select({ total: count() })
    .from(patientNotes)
    .innerJoin(patients, eq(patients.id, patientNotes.patientId))
    .where(and(eq(patients.branchId, branchId), gte(patientNotes.createdAt, range.start), lt(patientNotes.createdAt, range.end)));

  return row?.total ?? 0;
}

async function sumRevenue(branchId: string, range: DateRange) {
  const [row] = await db
    .select({ total: sql<string>`coalesce(sum(${payments.amount}), 0)` })
    .from(payments)
    .innerJoin(invoices, eq(invoices.id, payments.invoiceId))
    .where(and(eq(invoices.branchId, branchId), eq(payments.status, "succeeded"), gte(payments.paidAt, range.start), lt(payments.paidAt, range.end)));

  return Number(row?.total ?? 0);
}

export async function getDashboardRawData(branchId: string, ranges: { today: DateRange; month: DateRange; previousMonth: DateRange }) {
  const [
    totalPatients,
    currentMonthPatients,
    previousMonthPatients,
    todayAppointments,
    currentMonthAppointments,
    previousMonthAppointments,
    currentMonthRevenue,
    previousMonthRevenue,
    currentMonthAiNotes,
    previousMonthAiNotes,
    currentMonthPatientNotes,
    upcomingAppointments,
    pendingConfirmations
  ] = await Promise.all([
    countPatients(branchId),
    countPatients(branchId, ranges.month),
    countPatients(branchId, ranges.previousMonth),
    countAppointments(branchId, ranges.today),
    countAppointments(branchId, ranges.month),
    countAppointments(branchId, ranges.previousMonth),
    sumRevenue(branchId, ranges.month),
    sumRevenue(branchId, ranges.previousMonth),
    countAiNotes(branchId, ranges.month),
    countAiNotes(branchId, ranges.previousMonth),
    countPatientNotes(branchId, ranges.month),
    db
      .select({
        id: appointments.id,
        patientFirstName: patients.firstName,
        patientLastName: patients.lastName,
        doctorFirstName: doctors.firstName,
        doctorLastName: doctors.lastName,
        startsAt: appointments.startsAt,
        status: appointments.status
      })
      .from(appointments)
      .innerJoin(patients, eq(patients.id, appointments.patientId))
      .innerJoin(doctors, eq(doctors.id, appointments.doctorId))
      .where(and(eq(appointments.branchId, branchId), gte(appointments.startsAt, ranges.today.start), lt(appointments.startsAt, ranges.today.end)))
      .orderBy(asc(appointments.startsAt))
      .limit(6),
    db
      .select({ total: count() })
      .from(appointments)
      .where(and(eq(appointments.branchId, branchId), eq(appointments.status, "scheduled"), gte(appointments.startsAt, ranges.today.start), lt(appointments.startsAt, ranges.today.end)))
  ]);

  return {
    totalPatients,
    currentMonthPatients,
    previousMonthPatients,
    todayAppointments,
    currentMonthAppointments,
    previousMonthAppointments,
    currentMonthRevenue,
    previousMonthRevenue,
    currentMonthAiNotes,
    previousMonthAiNotes,
    currentMonthPatientNotes,
    upcomingAppointments,
    pendingConfirmations: pendingConfirmations[0]?.total ?? 0
  };
}
