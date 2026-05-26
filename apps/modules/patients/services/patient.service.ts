import { eq, ilike, or, desc } from "drizzle-orm";
import { db, patientMedicalHistories, patientNotes, patients, patientFamilyMembers, patientInsurance, appointments, invoices } from "@mediclinic/db";

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
  allergies: string | null;
  chronicDiseases: string | null;
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
    allergies?: string | null;
    chronicDiseases?: string | null;
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
        allergies: input.allergies || null,
        chronicDiseases: input.chronicDiseases || null,
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
      allergies?: string | null;
      chronicDiseases?: string | null;
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
        allergies: input.allergies || null,
        chronicDiseases: input.chronicDiseases || null,
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

  async familyMembers(patientId: string) {
    return db
      .select()
      .from(patientFamilyMembers)
      .where(eq(patientFamilyMembers.patientId, patientId))
      .orderBy(desc(patientFamilyMembers.createdAt));
  },

  async addFamilyMember(input: {
    patientId: string;
    fullName: string;
    relationship: string;
    phone?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    isEmergencyContact?: boolean;
  }) {
    const [member] = await db
      .insert(patientFamilyMembers)
      .values({
        patientId: input.patientId,
        fullName: input.fullName,
        relationship: input.relationship,
        phone: input.phone ?? null,
        dateOfBirth: input.dateOfBirth ?? null,
        gender: input.gender ?? null,
        isEmergencyContact: input.isEmergencyContact ?? false,
      })
      .returning();
    return member;
  },

  async removeFamilyMember(id: string) {
    await db.delete(patientFamilyMembers).where(eq(patientFamilyMembers.id, id));
  },

  async insuranceRecords(patientId: string) {
    return db
      .select()
      .from(patientInsurance)
      .where(eq(patientInsurance.patientId, patientId))
      .orderBy(desc(patientInsurance.createdAt));
  },

  async addInsurance(input: {
    patientId: string;
    provider: string;
    policyNumber: string;
    planName?: string | null;
    coverageType?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    isActive?: boolean;
  }) {
    const [record] = await db
      .insert(patientInsurance)
      .values({
        patientId: input.patientId,
        provider: input.provider,
        policyNumber: input.policyNumber,
        planName: input.planName ?? null,
        coverageType: input.coverageType ?? null,
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
        isActive: input.isActive ?? true,
      })
      .returning();
    return record;
  },

  async removeInsurance(id: string) {
    await db.delete(patientInsurance).where(eq(patientInsurance.id, id));
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
    allergies: p.allergies ?? null,
    chronicDiseases: p.chronicDiseases ?? null,
    isActive: p.isActive
  };
}
