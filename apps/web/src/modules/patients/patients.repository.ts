import { db, schema } from "@mediclinicpro/db";
import { and, asc, count, desc, eq, gte, ilike, inArray, or } from "drizzle-orm";
import type {
  CreatePatientInput,
  DoctorOption,
  PatientDocument,
  PatientFamilyMember,
  PatientFeedback,
  PatientListItem,
  PatientVisit,
  UpdatePatientInput,
} from "./patients.types";

type FindPatientsOptions = {
  query?: string;
  limit?: number;
};

type PatientDetailCollections = {
  documents?: PatientDocument[];
  familyMembers?: PatientFamilyMember[];
  feedback?: PatientFeedback[];
  visits?: PatientVisit[];
};

type PatientRow = typeof schema.patients.$inferSelect & {
  branchName?: string | null;
  branchCode?: string | null;
};

type PatientPortalUserInput = {
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  name: string;
  passwordHash: string;
  phone: string;
};

function mapPatient(row: PatientRow, details: PatientDetailCollections = {}): PatientListItem {
  return {
    id: row.id,
    branchId: row.branchId,
    branchName: row.branchName ?? null,
    branchCode: row.branchCode ?? null,
    firstName: row.firstName,
    lastName: row.lastName,
    fullName: `${row.firstName} ${row.lastName}`.trim(),
    email: row.email,
    phone: row.phone,
    dateOfBirth: row.dateOfBirth,
    age: row.age,
    gender: row.gender,
    bloodGroup: row.bloodGroup,
    doctorAssigned: row.doctorAssigned,
    admissionDate: row.admissionDate,
    dischargeDate: row.dischargeDate,
    status: row.status,
    address: row.address,
    allergies: row.allergies,
    medicalHistory: row.medicalHistory,
    insuranceProvider: row.insuranceProvider,
    insurancePolicyNumber: row.insurancePolicyNumber,
    insuranceMemberId: row.insuranceMemberId,
    insuranceGroupNumber: row.insuranceGroupNumber,
    portalLoginEnabled: row.portalLoginEnabled,
    portalLastLoginAt: row.portalLastLoginAt,
    familyMembers: details.familyMembers ?? [],
    visits: details.visits ?? [],
    documents: details.documents ?? [],
    feedback: details.feedback ?? [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function groupByPatientId<T extends { patientId: string }>(rows: T[]) {
  return rows.reduce<Record<string, T[]>>((groups, row) => {
    groups[row.patientId] ??= [];
    groups[row.patientId].push(row);
    return groups;
  }, {});
}

async function getPatientDetails(patientIds: string[]) {
  if (patientIds.length === 0) {
    return {};
  }

  const [familyRows, visitRows, documentRows, feedbackRows] = await Promise.all([
    db
      .select()
      .from(schema.patientFamilyMembers)
      .where(inArray(schema.patientFamilyMembers.patientId, patientIds))
      .orderBy(desc(schema.patientFamilyMembers.updatedAt)),
    db
      .select()
      .from(schema.patientVisits)
      .where(inArray(schema.patientVisits.patientId, patientIds))
      .orderBy(desc(schema.patientVisits.visitDate))
      .limit(150),
    db
      .select()
      .from(schema.patientDocuments)
      .where(inArray(schema.patientDocuments.patientId, patientIds))
      .orderBy(desc(schema.patientDocuments.createdAt))
      .limit(150),
    db
      .select()
      .from(schema.patientFeedback)
      .where(inArray(schema.patientFeedback.patientId, patientIds))
      .orderBy(desc(schema.patientFeedback.createdAt))
      .limit(150),
  ]);

  return {
    documents: groupByPatientId(documentRows),
    familyMembers: groupByPatientId(familyRows),
    feedback: groupByPatientId(feedbackRows),
    visits: groupByPatientId(visitRows),
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
    ilike(schema.branches.name, search),
    ilike(schema.branches.code, search),
  );
}

export async function findPatients({
  limit = 50,
  query,
}: FindPatientsOptions = {}): Promise<PatientListItem[]> {
  const rows = await db
    .select({
      id: schema.patients.id,
      branchId: schema.patients.branchId,
      branchName: schema.branches.name,
      branchCode: schema.branches.code,
      firstName: schema.patients.firstName,
      lastName: schema.patients.lastName,
      email: schema.patients.email,
      phone: schema.patients.phone,
      dateOfBirth: schema.patients.dateOfBirth,
      age: schema.patients.age,
      gender: schema.patients.gender,
      bloodGroup: schema.patients.bloodGroup,
      doctorAssigned: schema.patients.doctorAssigned,
      admissionDate: schema.patients.admissionDate,
      dischargeDate: schema.patients.dischargeDate,
      status: schema.patients.status,
      address: schema.patients.address,
      allergies: schema.patients.allergies,
      medicalHistory: schema.patients.medicalHistory,
      insuranceProvider: schema.patients.insuranceProvider,
      insurancePolicyNumber: schema.patients.insurancePolicyNumber,
      insuranceMemberId: schema.patients.insuranceMemberId,
      insuranceGroupNumber: schema.patients.insuranceGroupNumber,
      portalLoginEnabled: schema.patients.portalLoginEnabled,
      portalLastLoginAt: schema.patients.portalLastLoginAt,
      createdAt: schema.patients.createdAt,
      updatedAt: schema.patients.updatedAt,
    })
    .from(schema.patients)
    .leftJoin(schema.branches, eq(schema.patients.branchId, schema.branches.id))
    .where(buildPatientSearch(query))
    .orderBy(desc(schema.patients.updatedAt))
    .limit(limit);

  const details = await getPatientDetails(rows.map((row) => row.id));

  return rows.map((row) =>
    mapPatient(row, {
      documents: details.documents?.[row.id],
      familyMembers: details.familyMembers?.[row.id],
      feedback: details.feedback?.[row.id],
      visits: details.visits?.[row.id],
    }),
  );
}

export async function countPatients(query?: string) {
  const [result] = await db
    .select({ value: count() })
    .from(schema.patients)
    .leftJoin(schema.branches, eq(schema.patients.branchId, schema.branches.id))
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

export async function findDoctorOptions(): Promise<DoctorOption[]> {
  const rows = await db
    .select({
      id: schema.doctors.id,
      name: schema.users.name,
      specialization: schema.doctors.specialization,
    })
    .from(schema.doctors)
    .innerJoin(schema.users, eq(schema.doctors.userId, schema.users.id))
    .where(eq(schema.doctors.isAvailable, true))
    .orderBy(asc(schema.users.name));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    label: row.specialization ? `${row.name} - ${row.specialization}` : row.name,
  }));
}

export async function findPatientBranchOptions() {
  return db
    .select({
      id: schema.branches.id,
      name: schema.branches.name,
      code: schema.branches.code,
    })
    .from(schema.branches)
    .where(eq(schema.branches.isActive, true))
    .orderBy(asc(schema.branches.name));
}

export async function createPatient(input: CreatePatientInput) {
  const [patient] = await db.insert(schema.patients).values(input).returning();

  return patient ? mapPatient(patient) : null;
}

export async function createPatientWithPortalUser(
  input: CreatePatientInput,
  portalUser?: PatientPortalUserInput,
) {
  const patient = await db.transaction(async (tx) => {
    const [createdPatient] = await tx.insert(schema.patients).values(input).returning();

    if (!createdPatient) {
      return null;
    }

    if (portalUser) {
      const [createdUser] = await tx
        .insert(schema.users)
        .values({
          email: portalUser.email.toLowerCase(),
          emailVerified: portalUser.emailVerified,
          name: portalUser.name,
          password: portalUser.passwordHash,
        })
        .returning({ id: schema.users.id });

      if (createdUser) {
        await tx.insert(schema.userProfiles).values({
          userId: createdUser.id,
          firstName: portalUser.firstName,
          lastName: portalUser.lastName,
          phone: portalUser.phone,
          gender: input.gender === "unknown" ? null : input.gender,
          dateOfBirth: input.dateOfBirth,
          address: input.address ?? null,
        });
      }
    }

    return createdPatient;
  });

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
