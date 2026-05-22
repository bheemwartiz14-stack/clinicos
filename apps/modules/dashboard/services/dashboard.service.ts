import { and, asc, count, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { db, appointments, doctorAvailabilitySlots, doctorSpecialties, doctors, invoices, patients, roles, staffProfiles, userSessions, users } from "@mediclinic/db";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export const dashboardService = {
  async adminOverview() {
    const today = todayKey();
    const [doctorCount] = await db.select({ value: count() }).from(doctors);
    const [availableDoctorCount] = await db.select({ value: count() }).from(doctors).where(eq(doctors.isAvailable, true));
    const [staffCount] = await db.select({ value: count() }).from(staffProfiles);
    const [patientCount] = await db.select({ value: count() }).from(patients);
    const [activeSessionCount] = await db.select({ value: count() }).from(userSessions).where(eq(userSessions.isActive, true));
    const [todayApptCount] = await db.select({ value: count() }).from(appointments).where(eq(appointments.appointmentDate, today));
    const [slotCount] = await db.select({ value: count() }).from(doctorAvailabilitySlots).where(gte(doctorAvailabilitySlots.slotDate, today));
    const [roleCount] = await db.select({ value: count() }).from(roles);
    const [specialtyCount] = await db.select({ value: count() }).from(doctorSpecialties);

    const statusRows = await db
      .select({ status: appointments.status, value: count() })
      .from(appointments)
      .where(eq(appointments.appointmentDate, today))
      .groupBy(appointments.status);

    const recentDoctors = await db
      .select({
        id: doctors.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        status: users.status,
        isAvailable: doctors.isAvailable,
        consultationFee: doctors.consultationFee,
        specialty: doctorSpecialties.name
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .leftJoin(doctorSpecialties, eq(doctors.specialtyId, doctorSpecialties.id))
      .orderBy(desc(doctors.createdAt))
      .limit(6);

    return {
      metrics: {
        doctors: Number(doctorCount?.value ?? 0),
        availableDoctors: Number(availableDoctorCount?.value ?? 0),
        staff: Number(staffCount?.value ?? 0),
        patients: Number(patientCount?.value ?? 0),
        activeSessions: Number(activeSessionCount?.value ?? 0),
        upcomingSlots: Number(slotCount?.value ?? 0),
        roles: Number(roleCount?.value ?? 0),
        specialties: Number(specialtyCount?.value ?? 0),
        todayAppointments: Number(todayApptCount?.value ?? 0),
      },
      todayStatusCounts: Object.fromEntries(statusRows.map((r) => [r.status, Number(r.value)])),
      recentDoctors: recentDoctors.map((doctor) => ({
        id: doctor.id,
        name: [doctor.firstName, doctor.lastName].filter(Boolean).join(" "),
        email: doctor.email,
        status: doctor.status,
        isAvailable: doctor.isAvailable,
        consultationFee: doctor.consultationFee,
        specialty: doctor.specialty ?? "General"
      }))
    };
  },

  async doctorOverview(userId: string) {
    const today = todayKey();
    const [doctorRow] = await db
      .select({
        id: doctors.id,
        isAvailable: doctors.isAvailable,
        consultationFee: doctors.consultationFee,
        specialty: doctorSpecialties.name
      })
      .from(doctors)
      .leftJoin(doctorSpecialties, eq(doctors.specialtyId, doctorSpecialties.id))
      .where(eq(doctors.userId, userId))
      .limit(1);

    if (!doctorRow) return null;

    const doctorId = doctorRow.id;
    const [todayApptCount] = await db
      .select({ value: count() })
      .from(appointments)
      .where(and(eq(appointments.doctorId, doctorId), eq(appointments.appointmentDate, today)));

    const [completedCount] = await db
      .select({ value: count() })
      .from(appointments)
      .where(and(eq(appointments.doctorId, doctorId), eq(appointments.appointmentDate, today), eq(appointments.status, "completed")));

    const [patientCount] = await db
      .select({ value: count() })
      .from(appointments)
      .where(eq(appointments.doctorId, doctorId));

    const [checkedInCount] = await db
      .select({ value: count() })
      .from(appointments)
      .where(and(eq(appointments.doctorId, doctorId), eq(appointments.appointmentDate, today), eq(appointments.status, "checked_in")));

    const todayAppts = await db
      .select({
        id: appointments.id,
        startTime: appointments.startTime,
        status: appointments.status,
        patientName: patients.fullName,
        type: appointments.type
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .where(and(eq(appointments.doctorId, doctorId), eq(appointments.appointmentDate, today)))
      .orderBy(asc(appointments.startTime));

    return {
      doctorId,
      isAvailable: doctorRow.isAvailable,
      consultationFee: doctorRow.consultationFee,
      specialty: doctorRow.specialty ?? "General",
      todayAppointments: Number(todayApptCount?.value ?? 0),
      completedToday: Number(completedCount?.value ?? 0),
      totalPatients: Number(patientCount?.value ?? 0),
      checkedInNow: Number(checkedInCount?.value ?? 0),
      todaySchedule: todayAppts.map((a) => ({
        id: a.id,
        startTime: a.startTime,
        status: a.status,
        patientName: a.patientName,
        type: a.type
      }))
    };
  },

  async receptionistOverview() {
    const today = todayKey();
    const [todayApptCount] = await db
      .select({ value: count() })
      .from(appointments)
      .where(eq(appointments.appointmentDate, today));

    const statusRows = await db
      .select({ status: appointments.status, value: count() })
      .from(appointments)
      .where(eq(appointments.appointmentDate, today))
      .groupBy(appointments.status);

    const [patientCount] = await db.select({ value: count() }).from(patients);
    const [doctorCount] = await db.select({ value: count() }).from(doctors);

    const recentAppts = await db
      .select({
        id: appointments.id,
        startTime: appointments.startTime,
        status: appointments.status,
        patientName: patients.fullName,
        doctorFirstName: users.firstName,
        doctorLastName: users.lastName,
        type: appointments.type
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(eq(appointments.appointmentDate, today))
      .orderBy(asc(appointments.startTime))
      .limit(10);

    return {
      todayAppointments: Number(todayApptCount?.value ?? 0),
      patients: Number(patientCount?.value ?? 0),
      doctors: Number(doctorCount?.value ?? 0),
      statusCounts: Object.fromEntries(statusRows.map((r) => [r.status, Number(r.value)])),
      recentAppointments: recentAppts.map((a) => ({
        id: a.id,
        startTime: a.startTime,
        status: a.status,
        patientName: a.patientName,
        doctorName: [a.doctorFirstName, a.doctorLastName].filter(Boolean).join(" "),
        type: a.type
      }))
    };
  },

  async accountantOverview() {
    const today = todayKey();
    const [todayRevenue] = await db
      .select({ value: sql<number>`COALESCE(SUM(${invoices.totalAmount}), 0)` })
      .from(invoices)
      .where(and(eq(invoices.paymentStatus, "paid"), gte(invoices.createdAt, new Date(today + "T00:00:00")), lte(invoices.createdAt, new Date(today + "T23:59:59"))));

    const [pendingInvoices] = await db
      .select({ value: count() })
      .from(invoices)
      .where(or(eq(invoices.paymentStatus, "pending"), eq(invoices.paymentStatus, "partial")));

    const [totalInvoices] = await db.select({ value: count() }).from(invoices);
    const [todayInvoices] = await db
      .select({ value: count() })
      .from(invoices)
      .where(gte(invoices.createdAt, new Date(today + "T00:00:00")));

    const payStatusRows = await db
      .select({ status: invoices.paymentStatus, value: count() })
      .from(invoices)
      .groupBy(invoices.paymentStatus);

    return {
      todayRevenue: Number(todayRevenue?.value ?? 0),
      pendingInvoices: Number(pendingInvoices?.value ?? 0),
      totalInvoices: Number(totalInvoices?.value ?? 0),
      todayInvoices: Number(todayInvoices?.value ?? 0),
      payStatusCounts: Object.fromEntries(payStatusRows.map((r) => [r.status, Number(r.value)])),
    };
  }
};
