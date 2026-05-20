import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  appointments,
  doctors,
  departments,
  invoices,
  patientAddresses,
  patientAiSummaries,
  patientAllergies,
  patientDocuments,
  patientEmergencyContacts,
  patientFamilyMembers,
  patientFollowupSuggestions,
  patientInsurance,
  patientMedicalHistories,
  patientNotes,
  patientTimelines,
  patients,
  payments,
  users
} from "@mediclinic/db";
import { hashPassword } from "@mediclinic/auth";
import { generatePatientMrn } from "../utils/patient-mrn";
import type {
  PatientCreateInput,
  PatientDocumentUploadInput,
  PatientFollowupSuggestionInput,
  PatientMedicalHistoryInput,
  PatientNoteInput,
  PatientSearchInput,
  PatientUpdateInput
} from "../validations/patient.validation";

export async function listPatients(branchId: string, search?: PatientSearchInput) {
  const filters = [eq(patients.branchId, branchId)];
  if (search?.status === "active") filters.push(eq(patients.isActive, true));
  if (search?.status === "inactive") filters.push(eq(patients.isActive, false));
  if (search?.query) {
    const like = `%${search.query}%`;
    filters.push(or(
      ilike(patients.mrn, like),
      ilike(patients.firstName, like),
      ilike(patients.lastName, like),
      ilike(patients.phone, like),
      ilike(patients.email, like)
    )!);
  }

  return db
    .select({
      id: patients.id,
      userId: patients.userId,
      branchId: patients.branchId,
      mrn: patients.mrn,
      firstName: patients.firstName,
      lastName: patients.lastName,
      dateOfBirth: patients.dateOfBirth,
      sex: patients.sex,
      phone: patients.phone,
      email: patients.email,
      address: patients.address,
      emergencyContact: patients.emergencyContact,
      allergies: patients.allergies,
      medications: patients.medications,
      insurance: patients.insurance,
      isActive: patients.isActive,
      consentOnFile: patients.consentOnFile,
      createdAt: patients.createdAt,
      updatedAt: patients.updatedAt
    })
    .from(patients)
    .where(and(...filters))
    .orderBy(search?.sort === "created" ? desc(patients.createdAt) : search?.sort === "mrn" ? asc(patients.mrn) : asc(patients.lastName))
    .limit(100);
}

export async function getPatientProfile(branchId: string, patientId: string) {
  const [patient] = await db.select().from(patients).where(and(eq(patients.branchId, branchId), eq(patients.id, patientId))).limit(1);
  if (!patient) return null;

  const [
    addresses,
    emergencyContacts,
    insurancePolicies,
    allergiesList,
    familyMembers,
    medicalHistory,
    notes,
    documents,
    timeline,
    appointmentHistory,
    billingHistory,
    patientPayments,
    aiSummaries,
    followups
  ] = await Promise.all([
    db.select().from(patientAddresses).where(eq(patientAddresses.patientId, patientId)).orderBy(desc(patientAddresses.isPrimary), asc(patientAddresses.createdAt)),
    db.select().from(patientEmergencyContacts).where(eq(patientEmergencyContacts.patientId, patientId)).orderBy(desc(patientEmergencyContacts.isPrimary), asc(patientEmergencyContacts.priority)),
    db.select().from(patientInsurance).where(eq(patientInsurance.patientId, patientId)).orderBy(desc(patientInsurance.isPrimary), desc(patientInsurance.createdAt)),
    db.select().from(patientAllergies).where(eq(patientAllergies.patientId, patientId)).orderBy(asc(patientAllergies.allergen)),
    db.select().from(patientFamilyMembers).where(eq(patientFamilyMembers.patientId, patientId)).orderBy(asc(patientFamilyMembers.name)),
    db.select().from(patientMedicalHistories).where(eq(patientMedicalHistories.patientId, patientId)).orderBy(desc(patientMedicalHistories.recordedAt)),
    db.select().from(patientNotes).where(eq(patientNotes.patientId, patientId)).orderBy(desc(patientNotes.createdAt)).limit(50),
    db.select().from(patientDocuments).where(eq(patientDocuments.patientId, patientId)).orderBy(desc(patientDocuments.createdAt)).limit(50),
    db.select().from(patientTimelines).where(eq(patientTimelines.patientId, patientId)).orderBy(desc(patientTimelines.occurredAt)).limit(100),
    db
      .select({
        id: appointments.id,
        startsAt: appointments.startsAt,
        status: appointments.status,
        reason: appointments.reason,
        consultationMode: appointments.consultationMode,
        doctorFirstName: doctors.firstName,
        doctorLastName: doctors.lastName,
        departmentName: departments.name
      })
      .from(appointments)
      .innerJoin(doctors, eq(doctors.id, appointments.doctorId))
      .leftJoin(departments, eq(departments.id, doctors.departmentId))
      .where(and(eq(appointments.branchId, branchId), eq(appointments.patientId, patientId)))
      .orderBy(desc(appointments.startsAt))
      .limit(50),
    db.select().from(invoices).where(and(eq(invoices.branchId, branchId), eq(invoices.patientId, patientId))).orderBy(desc(invoices.createdAt)).limit(50),
    db.select().from(payments).where(eq(payments.patientId, patientId)).orderBy(desc(payments.createdAt)).limit(50),
    db.select().from(patientAiSummaries).where(eq(patientAiSummaries.patientId, patientId)).orderBy(desc(patientAiSummaries.createdAt)).limit(10),
    db.select().from(patientFollowupSuggestions).where(eq(patientFollowupSuggestions.patientId, patientId)).orderBy(desc(patientFollowupSuggestions.createdAt)).limit(20)
  ]);

  return { patient, addresses, emergencyContacts, insurancePolicies, allergiesList, familyMembers, medicalHistory, notes, documents, timeline, appointmentHistory, billingHistory, payments: patientPayments, aiSummaries, followups };
}

export async function createPatient(branchId: string, input: PatientCreateInput, createdByUserId?: string) {
  const mrn = generatePatientMrn();

  return db.transaction(async (tx) => {
    let portalUserId: string | null = null;

    if (input.portalAccess && input.email && input.portalPassword) {
      const [portalUser] = await tx
        .insert(users)
        .values({
          branchId,
          role: "patient",
          name: `${input.firstName} ${input.lastName}`,
          email: input.email.toLowerCase(),
          username: null,
          phone: input.phone,
          passwordHash: await hashPassword(input.portalPassword),
          isActive: true
        })
        .returning({ id: users.id });
      portalUserId = portalUser.id;
    }

    const [patient] = await tx
      .insert(patients)
      .values({
        userId: portalUserId,
        branchId,
        mrn,
        firstName: input.firstName,
        lastName: input.lastName,
        fullName: `${input.firstName} ${input.lastName}`,
        dateOfBirth: input.dateOfBirth,
        sex: input.sex,
        gender: input.sex,
        phone: input.phone,
        email: input.email || null,
        bloodGroup: input.bloodGroup,
        maritalStatus: input.maritalStatus,
        occupation: input.occupation,
        preferredLanguage: input.preferredLanguage,
        address: input.addressLine1
          ? {
              line1: input.addressLine1,
              line2: input.addressLine2 ?? undefined,
              city: input.city ?? "",
              state: input.state ?? "",
              postalCode: input.postalCode ?? ""
            }
          : null,
        emergencyContact: input.emergencyContactName
          ? {
              name: input.emergencyContactName,
              phone: input.emergencyContactPhone ?? "",
              relationship: input.emergencyContactRelationship ?? ""
            }
          : null,
        allergies: input.allergies,
        medications: input.medications,
        insurance: input.insurancePayer
          ? {
              payer: input.insurancePayer,
              memberId: input.insuranceMemberId ?? "",
              groupId: input.insuranceGroupId ?? undefined
            }
          : null,
        consentOnFile: input.consentOnFile,
        createdByUserId,
        updatedByUserId: createdByUserId
      })
      .returning();

    if (input.addressLine1 && input.city && input.state && input.postalCode) {
      await tx.insert(patientAddresses).values({
        patientId: patient.id,
        line1: input.addressLine1,
        line2: input.addressLine2,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: "USA",
        isPrimary: true
      });
    }

    if (input.emergencyContactName && input.emergencyContactPhone) {
      await tx.insert(patientEmergencyContacts).values({
        patientId: patient.id,
        name: input.emergencyContactName,
        phone: input.emergencyContactPhone,
        relationship: input.emergencyContactRelationship ?? "other",
        isPrimary: true,
        priority: 1
      });
    }

    if (input.insurancePayer && input.insuranceMemberId) {
      await tx.insert(patientInsurance).values({
        patientId: patient.id,
        payerName: input.insurancePayer,
        memberId: input.insuranceMemberId,
        groupNumber: input.insuranceGroupId,
        policyHolderName: `${input.firstName} ${input.lastName}`,
        verificationStatus: "pending",
        isPrimary: true
      } as any);
    }

    if (input.allergies.trim()) {
      await tx.insert(patientAllergies).values({
        patientId: patient.id,
        allergen: input.allergies.trim(),
        status: "active"
      });
    }

    await tx.insert(patientTimelines).values({
      patientId: patient.id,
      eventType: "registration",
      title: "Patient registered",
      description: "Quick registration completed.",
      createdByUserId: createdByUserId ?? null
    });

    return patient;
  });
}

export async function updatePatient(branchId: string, input: PatientUpdateInput, updatedByUserId?: string) {
  const [patient] = await db
    .update(patients)
    .set({
      firstName: input.firstName,
      lastName: input.lastName,
      fullName: input.firstName && input.lastName ? `${input.firstName} ${input.lastName}` : undefined,
      dateOfBirth: input.dateOfBirth,
      sex: input.sex,
      gender: input.sex,
      phone: input.phone,
      email: input.email || null,
      bloodGroup: input.bloodGroup,
      maritalStatus: input.maritalStatus,
      occupation: input.occupation,
      preferredLanguage: input.preferredLanguage,
      isActive: input.isActive,
      updatedByUserId,
      updatedAt: new Date()
    } as any)
    .where(and(eq(patients.branchId, branchId), eq(patients.id, input.patientId)))
    .returning();
  if (!patient) throw new Error("Patient not found.");
  return patient;
}

export async function softDeletePatient(branchId: string, patientId: string, updatedByUserId?: string) {
  const [patient] = await db
    .update(patients)
    .set({ isActive: false, deletedAt: new Date(), updatedByUserId, updatedAt: new Date() } as any)
    .where(and(eq(patients.branchId, branchId), eq(patients.id, patientId)))
    .returning();
  if (!patient) throw new Error("Patient not found.");
  return patient;
}

export async function createPatientNote(authorUserId: string, input: PatientNoteInput) {
  const [note] = await db
    .insert(patientNotes)
    .values({
      patientId: input.patientId,
      authorUserId,
      noteType: input.noteType,
      title: input.title,
      body: input.body,
      visibility: input.visibility,
      soap: input.soap,
      icd10Codes: input.icd10Codes,
      cptCodes: input.cptCodes,
      isSensitive: true
    } as any)
    .returning();

  await db.insert(patientTimelines).values({
    patientId: input.patientId,
    eventType: "note",
    title: input.title ?? "Clinical note added",
    description: input.body.slice(0, 240),
    createdByUserId: authorUserId
  });

  return note;
}

export async function createPatientMedicalHistory(authorUserId: string, input: PatientMedicalHistoryInput) {
  const [history] = await db.insert(patientMedicalHistories).values({
    patientId: input.patientId,
    conditionName: input.conditionName,
    diagnosisDate: input.diagnosisDate || null,
    status: input.status,
    severity: input.severity,
    notes: input.notes,
    recordedByUserId: authorUserId
  } as any).returning();

  await db.insert(patientTimelines).values({
    patientId: input.patientId,
    eventType: "diagnosis",
    title: input.conditionName,
    description: input.notes,
    createdByUserId: authorUserId
  });

  return history;
}

export async function createPatientDocument(uploadedByUserId: string, input: PatientDocumentUploadInput) {
  const [document] = await db.insert(patientDocuments).values({
    patientId: input.patientId,
    uploadedByUserId,
    documentType: input.documentType,
    title: input.title,
    fileName: input.fileName,
    mimeType: input.mimeType,
    storageKey: input.storageKey,
    byteSize: input.byteSize,
    description: input.description,
    isSensitive: input.isSensitive
  } as any).returning();

  await db.insert(patientTimelines).values({
    patientId: input.patientId,
    eventType: "document",
    title: `Document uploaded: ${input.title}`,
    description: input.description,
    createdByUserId: uploadedByUserId
  });

  return document;
}

export async function savePatientAiSummary(requestedByUserId: string, patientId: string, summary: string, sourceSnapshot: Record<string, unknown>, summaryType = "clinical") {
  const [record] = await db.insert(patientAiSummaries).values({
    patientId,
    requestedByUserId,
    summaryType,
    summary,
    sourceSnapshot,
    isSuggestionOnly: true
  } as any).returning();
  return record;
}

export async function savePatientFollowupSuggestion(requestedByUserId: string, input: PatientFollowupSuggestionInput) {
  const [record] = await db.insert(patientFollowupSuggestions).values({
    patientId: input.patientId,
    requestedByUserId,
    recommendedDate: input.recommendedDate || null,
    department: input.department,
    recommendedDoctorId: input.recommendedDoctorId,
    reason: input.reason,
    priority: input.priority,
    isSuggestionOnly: true
  } as any).returning();
  return record;
}
