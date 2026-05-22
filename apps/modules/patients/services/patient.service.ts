import { eq, ilike, or, desc } from "drizzle-orm";
import { db, patientMedicalHistories, patientNotes, patients, appointments, invoices } from "@mediclinic/db";

export type PatientRecord = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  bloodGroup: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  isActive: boolean;
};

export type PatientMedicalHistoryRecord = {
  id: string;
  patientId: string;
  condition: string;
  description: string | null;
  diagnosedAt: string | null;
  createdAt: Date;
};

export type PatientNoteRecord = {
  id: string;
  patientId: string;
  doctorId: string | null;
  note: string;
  createdAt: Date;
};

export const patientService = {
  async list(): Promise<PatientRecord[]> {
    const rows = await db
      .select()
      .from(patients)
      .orderBy(desc(patients.createdAt));

    return rows.map((p) => toPatientRecord(p));
  },

  async search(query: { q?: string }): Promise<PatientRecord[]> {
    const q = (query.q ?? "").trim();
    if (!q) return this.list();

    const like = `%${q}%`;
    const rows = await db
      .select()
      .from(patients)
      .where(
        or(
          ilike(patients.fullName, like),
          ilike(patients.phone, like),
          ilike(patients.email, like)
        )
      )
      .orderBy(desc(patients.createdAt));

    return rows.map((p) => toPatientRecord(p));
  },

  async get(id: string): Promise<PatientRecord | null> {
    const [row] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
    if (!row) return null;
    return toPatientRecord(row);
  },

  async create(input: {
    fullName: string;
    phone: string;
    email?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    bloodGroup?: string | null;
    address?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    isActive?: boolean;
  }) {
    const [created] = await db
      .insert(patients)
      .values({
        fullName: input.fullName,
        phone: input.phone,
        email: input.email || null,
        dateOfBirth: input.dateOfBirth || null,
        gender: input.gender || null,
        bloodGroup: input.bloodGroup || null,
        address: input.address || null,
        emergencyContactName: input.emergencyContactName || null,
        emergencyContactPhone: input.emergencyContactPhone || null,
        isActive: input.isActive ?? true
      })
      .returning();
    return created;
  },

  async update(
    id: string,
    input: {
      fullName: string;
      phone: string;
      email?: string | null;
      dateOfBirth?: string | null;
      gender?: string | null;
      bloodGroup?: string | null;
      address?: string | null;
      emergencyContactName?: string | null;
      emergencyContactPhone?: string | null;
      isActive?: boolean;
    }
  ) {
    const [updated] = await db
      .update(patients)
      .set({
        fullName: input.fullName,
        phone: input.phone,
        email: input.email || null,
        dateOfBirth: input.dateOfBirth || null,
        gender: input.gender || null,
        bloodGroup: input.bloodGroup || null,
        address: input.address || null,
        emergencyContactName: input.emergencyContactName || null,
        emergencyContactPhone: input.emergencyContactPhone || null,
        isActive: input.isActive ?? true
      })
      .where(eq(patients.id, id))
      .returning();
    return updated;
  },

  async medicalHistory(patientId: string): Promise<PatientMedicalHistoryRecord[]> {
    const rows = await db
      .select()
      .from(patientMedicalHistories)
      .where(eq(patientMedicalHistories.patientId, patientId))
      .orderBy(desc(patientMedicalHistories.createdAt));
    return rows.map((r) => ({
      id: r.id,
      patientId: r.patientId,
      condition: r.condition,
      description: r.description ?? null,
      diagnosedAt: r.diagnosedAt ? String(r.diagnosedAt) : null,
      createdAt: r.createdAt
    }));
  },

  async notes(patientId: string): Promise<PatientNoteRecord[]> {
    const rows = await db
      .select()
      .from(patientNotes)
      .where(eq(patientNotes.patientId, patientId))
      .orderBy(desc(patientNotes.createdAt));

    return rows.map((r) => ({
      id: r.id,
      patientId: r.patientId,
      doctorId: r.doctorId ?? null,
      note: r.note,
      createdAt: r.createdAt
    }));
  },

  async appointmentHistory(patientId: string) {
    const rows = await db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, patientId))
      .orderBy(desc(appointments.appointmentDate));

    return rows.map((r) => ({
      id: r.id,
      appointmentDate: r.appointmentDate,
      startTime: r.startTime,
      endTime: r.endTime,
      type: r.type,
      status: r.status,
      reason: r.reason
    }));
  },

  async billingHistory(patientId: string) {
    const rows = await db
      .select()
      .from(invoices)
      .where(eq(invoices.patientId, patientId))
      .orderBy(desc(invoices.createdAt));
    return rows.map((r) => ({
      id: r.id,
      invoiceNumber: r.invoiceNumber,
      totalAmount: r.totalAmount,
      paymentStatus: r.paymentStatus,
      createdAt: r.createdAt
    }));
  }
};

function toPatientRecord(p: typeof patients.$inferSelect): PatientRecord {
  return {
    id: p.id,
    fullName: p.fullName,
    phone: p.phone,
    email: p.email ?? null,
    dateOfBirth: p.dateOfBirth ? String(p.dateOfBirth) : null,
    gender: p.gender ?? null,
    bloodGroup: p.bloodGroup ?? null,
    address: p.address ?? null,
    emergencyContactName: p.emergencyContactName ?? null,
    emergencyContactPhone: p.emergencyContactPhone ?? null,
    isActive: p.isActive
  };
}
