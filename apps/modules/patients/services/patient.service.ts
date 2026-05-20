import { db } from "@mediclinic/db";
import { eq, and, like, or } from "drizzle-orm";
import { patients, patientNotes, patientDocuments, patientTimelines, branches } from "@mediclinic/db";
import type { PatientRecord, PatientWithDetails, PatientFilterInput } from "../types/patient.types";

export const patientService = {
  async list(filter?: PatientFilterInput): Promise<PatientRecord[]> {
    const conditions = [];
    if (filter?.branchId) conditions.push(eq(patients.branchId, filter.branchId));
    if (filter?.isActive !== undefined) conditions.push(eq(patients.isActive, filter.isActive));
    if (filter?.search) {
      const search = `%${filter.search}%`;
      conditions.push(
        or(
          like(patients.firstName, search),
          like(patients.lastName, search),
          like(patients.fullName, search),
          like(patients.mrn, search),
          like(patients.phone, search)
        )
      );
    }
    const result = await db.select().from(patients).where(conditions.length > 0 ? and(...conditions) : undefined);
    return result.map((p) => ({
      ...p,
      branchName: null
    }));
  },

  async getById(id: string): Promise<PatientRecord | null> {
    const result = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
    if (!result[0]) return null;
    return { ...result[0], branchName: null };
  },

  async getWithDetails(id: string): Promise<PatientWithDetails | null> {
    const result = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
    if (!result[0]) return null;
    const p = result[0];
    return {
      ...p,
      branchName: null,
      address: p.address as PatientWithDetails["address"],
      emergencyContact: p.emergencyContact as PatientWithDetails["emergencyContact"],
      insurance: p.insurance as PatientWithDetails["insurance"]
    };
  },

  async getNotes(patientId: string) {
    return db.select().from(patientNotes).where(eq(patientNotes.patientId, patientId));
  },

  async getDocuments(patientId: string) {
    return db.select().from(patientDocuments).where(eq(patientDocuments.patientId, patientId));
  },

  async getTimeline(patientId: string) {
    return db.select().from(patientTimelines).where(eq(patientTimelines.patientId, patientId));
  }
};