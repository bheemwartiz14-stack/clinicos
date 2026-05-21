import { and, asc, count, desc, eq, ilike, max, or, sql } from "drizzle-orm";
import { appointments, branches, db, patients } from "@mediclinic/db";
import type { PatientFormInput, PatientUpdateInput } from "../schemas/patient.schema";
import { formatPatientCode } from "../helpers/patient-code-generator.helper";

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? fullName,
    lastName: parts.slice(1).join(" ") || "Patient"
  };
}

function addressJson(address: string | null | undefined) {
  if (!address) return null;
  if (typeof address === "object") return address;
  return { line1: address, city: "", state: "", postalCode: "" };
}

function emergencyJson(name: string | null, phone: string | null) {
  return name || phone ? { name: name ?? "", phone: phone ?? "", relationship: "" } : null;
}

function normalize(row: {
  id: string;
  userId: string | null;
  branchId: string;
  branchName: string | null;
  mrn: string;
  patientCode: string | null;
  firstName: string;
  lastName: string;
  fullName: string | null;
  email: string | null;
  phone: string;
  dateOfBirth: string;
  gender: string | null;
  bloodGroup: string | null;
  maritalStatus: string | null;
  address: { line1: string; line2?: string | undefined; city: string; state: string; postalCode: string } | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  allergies: string;
  chronicDiseases: string;
  currentMedications: string;
  notes: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  appointmentCount: number;
  upcomingAppointmentCount: number;
  lastAppointmentAt?: Date | null;
}) {
  return {
    ...row,
    patientCode: row.patientCode ?? row.mrn,
    fullName: row.fullName ?? `${row.firstName} ${row.lastName}`.trim(),
    dateOfBirth: row.dateOfBirth,
    gender: row.gender as "male" | "female" | "transgender" | "non_binary" | "prefer_not_to_say" | "other" | null,
    bloodGroup: (row.bloodGroup ?? "unknown") as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "unknown",
    maritalStatus: row.maritalStatus as "single" | "married" | "divorced" | "widowed" | "separated" | null,
    address: row.address
  };
}

async function appointmentSummary(patientId: string) {
  const [total] = await db.select({ total: count() }).from(appointments).where(eq(appointments.patientId, patientId));
  const [upcoming] = await db
    .select({ total: count() })
    .from(appointments)
    .where(and(eq(appointments.patientId, patientId), sql`${appointments.startsAt} >= now()`, sql`${appointments.status} not in ('cancelled', 'no_show')`));
  const [last] = await db.select({ lastAppointmentAt: max(appointments.startsAt) }).from(appointments).where(eq(appointments.patientId, patientId));
  return {
    appointmentCount: total?.total ?? 0,
    upcomingAppointmentCount: upcoming?.total ?? 0,
    lastAppointmentAt: last?.lastAppointmentAt ?? null
  };
}

export async function getPatients(branchId: string, filter?: { search?: string }) {
  const conditions = [eq(patients.branchId, branchId)];
  if (filter?.search) {
    const search = `%${filter.search}%`;
    conditions.push(or(
      ilike(patients.fullName, search),
      ilike(patients.firstName, search),
      ilike(patients.lastName, search),
      ilike(patients.phone, search),
      ilike(patients.email, search),
      ilike(patients.patientCode, search),
      ilike(patients.mrn, search)
    ) as typeof conditions[number]);
  }
  const rows = await db
    .select({
      id: patients.id,
      userId: patients.userId,
      branchId: patients.branchId,
      branchName: branches.name,
      mrn: patients.mrn,
      patientCode: patients.patientCode,
      firstName: patients.firstName,
      lastName: patients.lastName,
      fullName: patients.fullName,
      email: patients.email,
      phone: patients.phone,
      dateOfBirth: patients.dateOfBirth,
      gender: patients.gender,
      bloodGroup: patients.bloodGroup,
      maritalStatus: patients.maritalStatus,
      address: patients.address,
      emergencyContactName: patients.emergencyContactName,
      emergencyContactPhone: patients.emergencyContactPhone,
      allergies: patients.allergies,
      chronicDiseases: patients.chronicDiseases,
      currentMedications: patients.currentMedications,
      notes: patients.notes,
      isActive: patients.isActive,
      createdAt: patients.createdAt,
      updatedAt: patients.updatedAt
    })
    .from(patients)
    .leftJoin(branches, eq(branches.id, patients.branchId))
    .where(and(...conditions))
    .orderBy(asc(patients.fullName), asc(patients.firstName));

  return Promise.all(rows.map(async (row) => normalize({ ...row, ...(await appointmentSummary(row.id)) })));
}

export async function getPatientById(branchId: string, id: string) {
  const [row] = await db.select({
    id: patients.id,
    userId: patients.userId,
    branchId: patients.branchId,
    branchName: branches.name,
    mrn: patients.mrn,
    patientCode: patients.patientCode,
    firstName: patients.firstName,
    lastName: patients.lastName,
    fullName: patients.fullName,
    email: patients.email,
    phone: patients.phone,
    dateOfBirth: patients.dateOfBirth,
    gender: patients.gender,
    bloodGroup: patients.bloodGroup,
    maritalStatus: patients.maritalStatus,
    address: patients.address,
    emergencyContactName: patients.emergencyContactName,
    emergencyContactPhone: patients.emergencyContactPhone,
    allergies: patients.allergies,
    chronicDiseases: patients.chronicDiseases,
    currentMedications: patients.currentMedications,
    notes: patients.notes,
    isActive: patients.isActive,
    createdAt: patients.createdAt,
    updatedAt: patients.updatedAt
  }).from(patients).leftJoin(branches, eq(branches.id, patients.branchId)).where(and(eq(patients.branchId, branchId), eq(patients.id, id))).limit(1);
  if (!row) return null;
  return { ...normalize({ ...row, ...(await appointmentSummary(row.id)) }), lastAppointmentAt: (await appointmentSummary(row.id)).lastAppointmentAt };
}

export async function getPatientByIdAnyBranch(id: string) {
  const [row] = await db.select({
    id: patients.id,
    userId: patients.userId,
    branchId: patients.branchId,
    branchName: branches.name,
    mrn: patients.mrn,
    patientCode: patients.patientCode,
    firstName: patients.firstName,
    lastName: patients.lastName,
    fullName: patients.fullName,
    email: patients.email,
    phone: patients.phone,
    dateOfBirth: patients.dateOfBirth,
    gender: patients.gender,
    bloodGroup: patients.bloodGroup,
    maritalStatus: patients.maritalStatus,
    address: patients.address,
    emergencyContactName: patients.emergencyContactName,
    emergencyContactPhone: patients.emergencyContactPhone,
    allergies: patients.allergies,
    chronicDiseases: patients.chronicDiseases,
    currentMedications: patients.currentMedications,
    notes: patients.notes,
    isActive: patients.isActive,
    createdAt: patients.createdAt,
    updatedAt: patients.updatedAt
  }).from(patients).leftJoin(branches, eq(branches.id, patients.branchId)).where(eq(patients.id, id)).limit(1);
  if (!row) return null;
  const summary = await appointmentSummary(row.id);
  return { ...normalize({ ...row, ...summary }), lastAppointmentAt: summary.lastAppointmentAt };
}

export async function getPatientByCode(branchId: string, patientCode: string) {
  const [patient] = await db.select().from(patients).where(and(eq(patients.branchId, branchId), eq(patients.patientCode, patientCode))).limit(1);
  return patient ?? null;
}

export async function getPatientByEmail(branchId: string, email: string) {
  const [patient] = await db.select().from(patients).where(and(eq(patients.branchId, branchId), eq(patients.email, email))).limit(1);
  return patient ?? null;
}

export async function getPatientByPhone(branchId: string, phone: string) {
  const [patient] = await db.select().from(patients).where(and(eq(patients.branchId, branchId), eq(patients.phone, phone))).limit(1);
  return patient ?? null;
}

export async function generateUniquePatientCode(branchId: string) {
  const year = new Date().getFullYear();
  const [row] = await db.select({ total: count() }).from(patients).where(and(eq(patients.branchId, branchId), ilike(patients.patientCode, `PAT-${year}-%`)));
  let sequence = (row?.total ?? 0) + 1;
  let code = formatPatientCode(year, sequence);
  while (await getPatientByCode(branchId, code)) {
    sequence += 1;
    code = formatPatientCode(year, sequence);
  }
  return code;
}

export async function createPatient(branchId: string, input: PatientFormInput & { patientCode: string; userId: string }) {
  const name = splitName(input.fullName);
  const [patient] = await db.insert(patients).values({
    branchId,
    mrn: input.patientCode,
    patientCode: input.patientCode,
    firstName: name.firstName,
    lastName: name.lastName,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    dateOfBirth: input.dateOfBirth,
    gender: input.gender ?? "other",
    bloodGroup: input.bloodGroup,
    maritalStatus: input.maritalStatus ?? "single",
    address: addressJson(input.address),
    emergencyContactName: input.emergencyContactName,
    emergencyContactPhone: input.emergencyContactPhone,
    emergencyContact: emergencyJson(input.emergencyContactName, input.emergencyContactPhone),
    allergies: input.allergies,
    chronicDiseases: input.chronicDiseases,
    currentMedications: input.currentMedications,
    notes: input.notes,
    isActive: input.isActive,
    createdByUserId: input.userId,
    updatedByUserId: input.userId
  }).returning();
  return patient;
}

export async function updatePatient(
  branchId: string,
  input: PatientUpdateInput & { userId: string }
) {
  const name = splitName(input.fullName);

  const [patient] = await db
    .update(patients)
    .set({
      patientCode: input.patientCode,

      firstName: name.firstName,
      lastName: name.lastName,

      fullName: input.fullName,

      email: input.email,
      phone: input.phone,

      dateOfBirth: input.dateOfBirth,

      gender: input.gender ?? "other",

      bloodGroup: input.bloodGroup,

      maritalStatus: input.maritalStatus ?? "single",

      address: addressJson(input.address),

      emergencyContactName:
        input.emergencyContactName,

      emergencyContactPhone:
        input.emergencyContactPhone,

      emergencyContact: emergencyJson(
        input.emergencyContactName,
        input.emergencyContactPhone
      ),

      allergies: input.allergies,

      chronicDiseases:
        input.chronicDiseases,

      currentMedications:
        input.currentMedications,

      notes: input.notes,

      isActive: input.isActive,

      updatedByUserId: input.userId,

      updatedAt: new Date()
    })
    .where(
      and(
        eq(patients.branchId, branchId),
        eq(patients.id, input.id)
      )
    )
    .returning();

  return patient;
}
export async function deletePatient(branchId: string, id: string) {
  const [patient] = await db.delete(patients).where(and(eq(patients.branchId, branchId), eq(patients.id, id))).returning();
  return patient ?? null;
}

export async function togglePatientStatus(branchId: string, id: string) {
  const current = await getPatientById(branchId, id);
  if (!current) throw new Error("Patient not found.");
  const [patient] = await db.update(patients).set({ isActive: !current.isActive, updatedAt: new Date() }).where(and(eq(patients.branchId, branchId), eq(patients.id, id))).returning();
  return patient;
}

export async function checkPatientHasAppointments(patientId: string) {
  const [row] = await db.select({ total: count() }).from(appointments).where(eq(appointments.patientId, patientId));
  return (row?.total ?? 0) > 0;
}
