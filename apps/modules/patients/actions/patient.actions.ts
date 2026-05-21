"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { z } from "zod";
import { requirePermission } from "../../../web/lib/auth";
import { patientFormSchema, patientUpdateSchema } from "../schemas/patient.schema";
import { patientService } from "../services/patient.service";

export type PatientActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : "";
}

function checked(formData: FormData, key: string) {
  return value(formData, key) === "true" || value(formData, key) === "on";
}

function payload(formData: FormData) {
  return {
    patientCode: value(formData, "patientCode") || null,
    fullName: value(formData, "fullName"),
    email: value(formData, "email"),
    phone: value(formData, "phone"),
    dateOfBirth: value(formData, "dateOfBirth"),
    sex: value(formData, "sex"),
    gender: value(formData, "gender") || null,
    bloodGroup: value(formData, "bloodGroup") || "unknown",
    maritalStatus: value(formData, "maritalStatus") || null,
    address: value(formData, "address") || null,
    emergencyContactName: value(formData, "emergencyContactName") || null,
    emergencyContactPhone: value(formData, "emergencyContactPhone") || null,
    allergies: value(formData, "allergies"),
    chronicDiseases: value(formData, "chronicDiseases"),
    currentMedications: value(formData, "currentMedications"),
    notes: value(formData, "notes"),
    isActive: checked(formData, "isActive")
  };
}

function failure(error: unknown): PatientActionState {
  if (error instanceof z.ZodError) {
    return { ok: false, message: "Please fix the highlighted patient details.", fieldErrors: error.flatten().fieldErrors };
  }
  return { ok: false, message: error instanceof Error ? error.message : "Patient action failed." };
}

export async function createPatientAction(formData: FormData): Promise<PatientActionState> {
  const session = await requirePermission("patients.create");
  const parsed = patientFormSchema.safeParse(payload(formData));
  if (!parsed.success) return failure(parsed.error);
  try {
    await patientService.createPatientFromForm(session.branchId, session.userId, parsed.data);
  } catch (error) {
    return failure(error);
  }
  revalidatePath("/patients");
  redirect("/patients" as Route);
}

export async function updatePatientAction(formData: FormData): Promise<PatientActionState> {
  const session = await requirePermission("patients.edit");
  const parsed = patientUpdateSchema.safeParse({ id: value(formData, "id"), ...payload(formData) });
  if (!parsed.success) return failure(parsed.error);

  try {
    await patientService.updatePatientFromForm(session.branchId, session.userId, parsed.data);
  } catch (error) {
    return failure(error);
  }

  revalidatePath("/patients");
  revalidatePath(`/patients/${parsed.data.id}`);
  redirect(`/patients/${parsed.data.id}` as Route);
}

export async function deletePatientAction(formData: FormData): Promise<PatientActionState> {
  const session = await requirePermission("patients.delete");
  const id = value(formData, "id");
  if (!id) return { ok: false, message: "Patient ID is required." };

  try {
    await patientService.deletePatientFromForm(session.branchId, id);
  } catch (error) {
    return failure(error);
  }

  revalidatePath("/patients");
  redirect("/patients" as Route);
}

export async function togglePatientStatusAction(formData: FormData): Promise<PatientActionState> {
  const session = await requirePermission("patients.manage");
  const id = value(formData, "id");
  if (!id) return { ok: false, message: "Patient ID is required." };

  try {
    await patientService.togglePatientStatusFromForm(session.branchId, id);
  } catch (error) {
    return failure(error);
  }

  revalidatePath("/patients");
  revalidatePath(`/patients/${id}`);
  return { ok: true, message: "Patient status updated." };
}
