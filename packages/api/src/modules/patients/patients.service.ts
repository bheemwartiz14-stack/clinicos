import { schema, type Db } from "@mediclinicpro/db";
import type { PatientCreateInput, PatientUpdateInput } from "@mediclinicpro/validations";
import { and, desc, eq, ilike, or } from "drizzle-orm";

export function listPatients(db: Db, input: { query?: string; limit: number }) {
  const search = input.query ? `%${input.query}%` : undefined;

  return db
    .select()
    .from(schema.patients)
    .where(
      search
        ? or(
            ilike(schema.patients.firstName, search),
            ilike(schema.patients.lastName, search),
            ilike(schema.patients.phone, search),
          )
        : undefined,
    )
    .orderBy(desc(schema.patients.updatedAt))
    .limit(input.limit);
}

export function getPatientById(db: Db, id: string) {
  return db.query.patients.findFirst({
    where: eq(schema.patients.id, id),
    with: {
      appointments: true,
      invoices: true,
      prescriptions: true,
    },
  });
}

export function createPatient(db: Db, input: PatientCreateInput) {
  return db.insert(schema.patients).values(input).returning();
}

export async function updatePatient(db: Db, input: PatientUpdateInput) {
  const { id, version, ...data } = input;
  const [updated] = await db
    .update(schema.patients)
    .set({ ...data, version: version + 1, updatedAt: new Date() })
    .where(and(eq(schema.patients.id, id), eq(schema.patients.version, version)))
    .returning();

  if (!updated) {
    throw new Error("Patient was changed elsewhere. Refresh and try again.");
  }

  return updated;
}

export function deletePatient(db: Db, id: string) {
  return db.delete(schema.patients).where(eq(schema.patients.id, id)).returning();
}
