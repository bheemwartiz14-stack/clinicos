"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "../../../web/lib/auth";
import { patientService } from "../services/patient.service";
import {
  patientAISummaryRequestSchema,
  patientCreateSchema,
  patientDocumentUploadSchema,
  patientMedicalHistorySchema,
  patientNoteSchema,
  patientUpdateSchema
} from "../validations/patient.validation";

export type PatientActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function value(formData: FormData, key: string) {
  const formValue = formData.get(key);
  return typeof formValue === "string" ? formValue : "";
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function failure(error: unknown): PatientActionState {
  console.error("Patient action error:", error);
  if (error instanceof z.ZodError) {
    const flattened = error.flatten();
    console.log("Zod field errors:", flattened.fieldErrors);
    console.log("Zod form errors:", flattened.formErrors);
    return {
      ok: false,
      message:
        flattened.formErrors.join(", ") ||
        "Validation failed.",
      fieldErrors: flattened.fieldErrors,
    };
  }
  if (error instanceof Error) {
    console.error("Error message:", error.message);
  }

  return {
    ok: false,
    message:
      error instanceof Error
        ? error.message
        : "Something went wrong.",
    fieldErrors: {},
  };
}

export async function createPatientAction(_state: PatientActionState | null, formData: FormData): Promise<PatientActionState> {
  const session = await requirePermission("patients.create");
  console.log(session);
  try {
    await patientService.create(
      session.branchId,
      patientCreateSchema.parse({
        firstName: value(formData, "firstName"),
        lastName: value(formData, "lastName"),
        dateOfBirth: value(formData, "dateOfBirth"),
        sex: value(formData, "sex"),
        phone: value(formData, "phone"),
        email: value(formData, "email"),
        addressLine1: value(formData, "addressLine1"),
        addressLine2: value(formData, "addressLine2"),
        city: value(formData, "city"),
        state: value(formData, "state"),
        postalCode: value(formData, "postalCode"),
        emergencyContactName: value(formData, "emergencyContactName"),
        emergencyContactPhone: value(formData, "emergencyContactPhone"),
        emergencyContactRelationship: value(formData, "emergencyContactRelationship"),
        allergies: value(formData, "allergies"),
        medications: value(formData, "medications"),
        insurancePayer: value(formData, "insurancePayer"),
        insuranceMemberId: value(formData, "insuranceMemberId"),
        insuranceGroupId: value(formData, "insuranceGroupId"),
        consentOnFile: checked(formData, "consentOnFile"),
        portalAccess: checked(formData, "portalAccess"),
        portalPassword: value(formData, "portalPassword")
      }),
      session.userId
    );
    revalidatePath("/patients");
    return { ok: true, message: "Patient registered." };
  } catch (error) {
    return failure(error);
  }
}

export async function updatePatientAction(_state: PatientActionState | null, formData: FormData): Promise<PatientActionState> {
  const session = await requirePermission("patients.edit");
  try {
    const patientId = value(formData, "patientId");
    await patientService.update(session.branchId, patientUpdateSchema.parse({
      patientId,
      firstName: value(formData, "firstName"),
      lastName: value(formData, "lastName"),
      dateOfBirth: value(formData, "dateOfBirth"),
      sex: value(formData, "sex"),
      phone: value(formData, "phone"),
      email: value(formData, "email"),
      bloodGroup: value(formData, "bloodGroup"),
      maritalStatus: value(formData, "maritalStatus"),
      occupation: value(formData, "occupation"),
      preferredLanguage: value(formData, "preferredLanguage"),
      isActive: checked(formData, "isActive")
    }), session.userId);
    revalidatePath(`/patients/${patientId}`);
    revalidatePath("/patients");
    return { ok: true, message: "Patient updated." };
  } catch (error) {
    return failure(error);
  }
}

export async function deletePatientAction(_state: PatientActionState | null, formData: FormData): Promise<PatientActionState> {
  const session = await requirePermission("patients.delete");
  try {
    await patientService.remove(session.branchId, value(formData, "patientId"), session.userId);
    revalidatePath("/patients");
    return { ok: true, message: "Patient archived." };
  } catch (error) {
    return failure(error);
  }
}

export async function createPatientNoteAction(_state: PatientActionState | null, formData: FormData): Promise<PatientActionState> {
  const session = await requirePermission("patients.notes.manage");
  try {
    const patientId = value(formData, "patientId");
    await patientService.createNote(session.userId, patientNoteSchema.parse({
      patientId,
      noteType: value(formData, "noteType") || "general",
      title: value(formData, "title"),
      body: value(formData, "body"),
      visibility: value(formData, "visibility") || "care_team",
      icd10Codes: value(formData, "icd10Codes").split(",").map((item) => item.trim()).filter(Boolean),
      cptCodes: value(formData, "cptCodes").split(",").map((item) => item.trim()).filter(Boolean)
    }));
    revalidatePath(`/patients/${patientId}`);
    return { ok: true, message: "Note added. Sensitive notes remain permission protected." };
  } catch (error) {
    return failure(error);
  }
}

export async function createPatientMedicalHistoryAction(_state: PatientActionState | null, formData: FormData): Promise<PatientActionState> {
  const session = await requirePermission("patients.medical.manage");
  try {
    const patientId = value(formData, "patientId");
    await patientService.createMedicalHistory(session.userId, patientMedicalHistorySchema.parse({
      patientId,
      conditionName: value(formData, "conditionName"),
      diagnosisDate: value(formData, "diagnosisDate"),
      status: value(formData, "status") || "active",
      severity: value(formData, "severity") || "unknown",
      notes: value(formData, "notes")
    }));
    revalidatePath(`/patients/${patientId}`);
    revalidatePath(`/patients/${patientId}/timeline`);
    return { ok: true, message: "Medical history entry added." };
  } catch (error) {
    return failure(error);
  }
}

export async function createPatientDocumentAction(_state: PatientActionState | null, formData: FormData): Promise<PatientActionState> {
  const session = await requirePermission("patients.documents.upload");
  try {
    const patientId = value(formData, "patientId");
    const fileName = value(formData, "fileName");
    await patientService.createDocument(session.userId, patientDocumentUploadSchema.parse({
      patientId,
      documentType: value(formData, "documentType") || "other",
      title: value(formData, "title"),
      fileName,
      mimeType: value(formData, "mimeType"),
      byteSize: value(formData, "byteSize"),
      storageKey: value(formData, "storageKey") || `/uploads/patients/${patientId}/${fileName}`,
      description: value(formData, "description"),
      isSensitive: checked(formData, "isSensitive")
    }));
    revalidatePath(`/patients/${patientId}/documents`);
    revalidatePath(`/patients/${patientId}`);
    return { ok: true, message: "Document metadata saved." };
  } catch (error) {
    return failure(error);
  }
}

export async function createPatientAiSummaryAction(_state: PatientActionState | null, formData: FormData): Promise<PatientActionState> {
  const session = await requirePermission("patients.ai.summary");
  try {
    const patientId = value(formData, "patientId");
    await patientService.createAiSummary(session.userId, session.branchId, patientAISummaryRequestSchema.parse({
      patientId,
      summaryType: value(formData, "summaryType") || "clinical"
    }));
    revalidatePath(`/patients/${patientId}`);
    return { ok: true, message: "AI suggestion-only summary generated." };
  } catch (error) {
    return failure(error);
  }
}

export async function createPatientFollowupSuggestionAction(_state: PatientActionState | null, formData: FormData): Promise<PatientActionState> {
  const session = await requirePermission("patients.ai.followup");
  try {
    const patientId = value(formData, "patientId");
    await patientService.createFollowupSuggestion(session.userId, session.branchId, { patientId });
    revalidatePath(`/patients/${patientId}`);
    return { ok: true, message: "AI follow-up suggestion generated for approval." };
  } catch (error) {
    return failure(error);
  }
}
