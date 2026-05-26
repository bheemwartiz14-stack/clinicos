import { and, eq, gte, lte, asc, sql } from "drizzle-orm";
import { db, appointments, appointmentStatusLogs, appointmentReschedules, patients, doctors, users, doctorAvailabilitySlots, doctorSpecialties } from "@mediclinic/db";

export type AppointmentRecord = {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string | null;
  slotId: string | null;
  appointmentDate: string;
  startTime: string;
  endTime: string | null;
  type: string;
  status: string;
  reason: string | null;
  notes: string | null;
  queueTokenNumber: number | null;
  createdById: string | null;
};

export type AvailableSlot = {
  id: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string | null;
};

export type DoctorOption = {
  id: string;
  name: string;
  specialty: string | null;
};

type AppointmentJoinRow = {
  appointment: typeof appointments.$inferSelect;
  patient: typeof patients.$inferSelect;
  doctor: typeof doctors.$inferSelect;
  user: typeof users.$inferSelect;
  specialty: typeof doctorSpecialties.$inferSelect | null;
};

function toAppointmentRecord(row: AppointmentJoinRow): AppointmentRecord {
  return {
    id: row.appointment.id,
    patientId: row.appointment.patientId,
    patientName: row.patient.fullName,
    patientPhone: row.patient.phone,
    doctorId: row.appointment.doctorId,
    doctorName: [row.user.firstName, row.user.lastName].filter(Boolean).join(" "),
    doctorSpecialty: row.specialty?.name ?? null,
    slotId: row.appointment.slotId,
    appointmentDate: row.appointment.appointmentDate,
    startTime: row.appointment.startTime,
    endTime: row.appointment.endTime,
    type: row.appointment.type,
    status: row.appointment.status,
    reason: row.appointment.reason,
    notes: row.appointment.notes,
    queueTokenNumber: row.appointment.queueTokenNumber,
    createdById: row.appointment.createdById,
  };
}

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

export const appointmentService = {
  async list(filters?: {
    date?: string;
    doctorId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<AppointmentRecord[]> {
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

  async get(id: string): Promise<AppointmentRecord | null> {
    const [row] = await buildBaseQuery()
      .where(eq(appointments.id, id))
      .limit(1);

    return row ? toAppointmentRecord(row) : null;
  },

  async create(input: {
    patientId: string;
    doctorId: string;
    slotId?: string | null;
    appointmentDate: string;
    startTime: string;
    endTime?: string | null;
    type?: string;
    status?: string;
    reason?: string | null;
    notes?: string | null;
    consultationLink?: string | null;
    createdById?: string | null;
  }) {
    const maxToken = await db
      .select({ max: sql<number>`COALESCE(MAX(${appointments.queueTokenNumber}), 0)` })
      .from(appointments)
      .where(and(
        eq(appointments.doctorId, input.doctorId),
        eq(appointments.appointmentDate, input.appointmentDate)
      ));

    const nextToken = (maxToken[0]?.max ?? 0) + 1;

    const [created] = await db
      .insert(appointments)
      .values({
        patientId: input.patientId,
        doctorId: input.doctorId,
        slotId: input.slotId ?? null,
        appointmentDate: input.appointmentDate,
        startTime: input.startTime,
        endTime: input.endTime ?? null,
        type: (input.type ?? "in_clinic") as any,
        status: (input.status ?? "booked") as any,
        reason: input.reason ?? null,
        notes: input.notes ?? null,
        consultationLink: input.consultationLink ?? null,
        queueTokenNumber: nextToken,
        createdById: input.createdById ?? null,
      })
      .returning();

    if (input.slotId) {
      await db.update(doctorAvailabilitySlots).set({ isBooked: true }).where(eq(doctorAvailabilitySlots.id, input.slotId));
    }

    return created;
  },

  async updateStatus(id: string, newStatus: string, changedById?: string | null, remarks?: string | null) {
    const [current] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
    if (!current) throw new Error("Appointment not found");

    const oldStatus = current.status;

    await db.update(appointments).set({ status: newStatus as any }).where(eq(appointments.id, id));

    await db.insert(appointmentStatusLogs).values({
      appointmentId: id,
      oldStatus: oldStatus as any,
      newStatus: newStatus as any,
      changedById: changedById ?? null,
      remarks: remarks ?? null,
    });

    if (newStatus === "cancelled" && current.slotId) {
      await db.update(doctorAvailabilitySlots).set({ isBooked: false }).where(eq(doctorAvailabilitySlots.id, current.slotId));
    }
  },

  async reschedule(
    id: string,
    input: {
      newDate: string;
      newStartTime: string;
      newSlotId?: string | null;
      reason?: string | null;
      changedById?: string | null;
    }
  ) {
    const [current] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
    if (!current) throw new Error("Appointment not found");

    if (current.slotId) {
      await db.update(doctorAvailabilitySlots).set({ isBooked: false }).where(eq(doctorAvailabilitySlots.id, current.slotId));
    }

    await db.update(appointments).set({
      appointmentDate: input.newDate,
      startTime: input.newStartTime,
      slotId: input.newSlotId ?? null,
      status: "rescheduled",
    }).where(eq(appointments.id, id));

    await db.insert(appointmentReschedules).values({
      appointmentId: id,
      oldDate: current.appointmentDate,
      oldStartTime: current.startTime,
      newDate: input.newDate,
      newStartTime: input.newStartTime,
      reason: input.reason ?? null,
      rescheduledById: input.changedById ?? null,
    });

    if (input.newSlotId) {
      await db.update(doctorAvailabilitySlots).set({ isBooked: true }).where(eq(doctorAvailabilitySlots.id, input.newSlotId));
    }
  },

  async update(
    id: string,
    input: {
      reason?: string | null;
      notes?: string | null;
      type?: string;
    }
  ) {
    await db.update(appointments).set({
      reason: input.reason ?? null,
      notes: input.notes ?? null,
      type: input.type as any,
    }).where(eq(appointments.id, id));
  },

  async getQueue(doctorId: string, date: string) {
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

  async createRecurring(input: {
    patientId: string;
    doctorId: string;
    slotId?: string | null;
    appointmentDate: string;
    startTime: string;
    endTime?: string | null;
    type?: string;
    reason?: string | null;
    notes?: string | null;
    createdById?: string | null;
    recurringPattern: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly";
    recurringEndDate: string;
  }) {
    const dates: string[] = [];
    const start = new Date(input.appointmentDate);
    const end = new Date(input.recurringEndDate);

    switch (input.recurringPattern) {
      case "daily": {
        let d = new Date(start);
        while (d <= end) { dates.push(d.toISOString().split("T")[0]); d.setDate(d.getDate() + 1); }
        break;
      }
      case "weekly": {
        let d = new Date(start);
        while (d <= end) { dates.push(d.toISOString().split("T")[0]); d.setDate(d.getDate() + 7); }
        break;
      }
      case "biweekly": {
        let d = new Date(start);
        while (d <= end) { dates.push(d.toISOString().split("T")[0]); d.setDate(d.getDate() + 14); }
        break;
      }
      case "monthly": {
        let d = new Date(start);
        while (d <= end) { dates.push(d.toISOString().split("T")[0]); d.setMonth(d.getMonth() + 1); }
        break;
      }
      case "quarterly": {
        let d = new Date(start);
        while (d <= end) { dates.push(d.toISOString().split("T")[0]); d.setMonth(d.getMonth() + 3); }
        break;
      }
    }

    const parent = await this.create({ ...input, status: "booked" });

    for (let i = 1; i < dates.length; i++) {
      await db.insert(appointments).values({
        patientId: input.patientId,
        doctorId: input.doctorId,
        slotId: input.slotId ?? null,
        appointmentDate: dates[i],
        startTime: input.startTime,
        endTime: input.endTime ?? null,
        type: (input.type ?? "in_clinic") as any,
        status: "booked",
        reason: input.reason ?? null,
        notes: input.notes ?? null,
        isRecurring: true,
        recurringPattern: input.recurringPattern as any,
        recurringEndDate: input.recurringEndDate,
        parentAppointmentId: parent.id,
        createdById: input.createdById ?? null,
      });
    }

    return parent;
  },

  async getDoctors(): Promise<DoctorOption[]> {
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

  async getAvailability(doctorId: string, date: string) {
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
    }));
  },
};
