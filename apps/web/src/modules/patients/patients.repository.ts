import { db, schema } from "@mediclinicpro/db";
import { and, count, desc, eq, gte, ilike, or } from "drizzle-orm";
import type { CreatePatientInput, PatientListItem, UpdatePatientInput } from "./patients.types";

type FindPatientsOptions = {
  query?: string;
  limit?: number;
};

function mapPatient(row: typeof schema.patients.$inferSelect): PatientListItem {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    fullName: `${row.firstName} ${row.lastName}`.trim(),
    email: row.email,
    phone: row.phone,
    dateOfBirth: row.dateOfBirth,
    gender: row.gender,
    bloodGroup: row.bloodGroup,
    address: row.address,
    allergies: row.allergies,
    medicalHistory: row.medicalHistory,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function buildPatientSearch(query?: string) {
  const normalizedQuery = query?.trim();

  if (!normalizedQuery) {
    return undefined;
  }

  const search = `%${normalizedQuery}%`;

  return or(
    ilike(schema.patients.firstName, search),
    ilike(schema.patients.lastName, search),
    ilike(schema.patients.phone, search),
    ilike(schema.patients.email, search),
  );
}

export async function findPatients({
  limit = 50,
  query,
}: FindPatientsOptions = {}): Promise<PatientListItem[]> {
  const rows = await db
    .select()
    .from(schema.patients)
    .where(buildPatientSearch(query))
    .orderBy(desc(schema.patients.updatedAt))
    .limit(limit);

  return rows.map(mapPatient);
}

export async function countPatients(query?: string) {
  const [result] = await db
    .select({ value: count() })
    .from(schema.patients)
    .where(buildPatientSearch(query));

  return Number(result?.value ?? 0);
}

export async function countNewPatientsSince(date: Date) {
  const [result] = await db
    .select({ value: count() })
    .from(schema.patients)
    .where(gte(schema.patients.createdAt, date));

  return Number(result?.value ?? 0);
}

export async function countUpdatedPatientsSince(date: Date) {
  const [result] = await db
    .select({ value: count() })
    .from(schema.patients)
    .where(and(gte(schema.patients.updatedAt, date)));

  return Number(result?.value ?? 0);
}

export async function createPatient(input: CreatePatientInput) {
  const [patient] = await db.insert(schema.patients).values(input).returning();

  return patient ? mapPatient(patient) : null;
}

export async function updatePatient(id: string, input: UpdatePatientInput) {
  const [patient] = await db
    .update(schema.patients)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(schema.patients.id, id))
    .returning();

  return patient ? mapPatient(patient) : null;
}

export async function deletePatient(id: string) {
  const [patient] = await db
    .delete(schema.patients)
    .where(eq(schema.patients.id, id))
    .returning({ id: schema.patients.id });

  return patient ?? null;
}
