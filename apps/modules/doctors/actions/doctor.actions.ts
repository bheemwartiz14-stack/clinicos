"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { z } from "zod";
import { requirePermission } from "../../../web/lib/auth";
import { doctorService } from "../services/doctor.service";
import { doctorCreateSchema, doctorDaysOfWeek, doctorUpdateSchema, type DoctorCreateInput, type DoctorUpdateInput } from "../schemas/doctor.schema";

export type DoctorActionState = {
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

function optionalSelect(formData: FormData, key: string) {
  const selected = value(formData, key);
  return selected && selected !== "none" ? selected : null;
}

function schedulesPayload(formData: FormData) {
  return doctorDaysOfWeek.map((day) => ({
    dayOfWeek: day,
    isActive: checked(formData, `schedule.${day}.isActive`),
    startTime: value(formData, `schedule.${day}.startTime`) || "09:00",
    endTime: value(formData, `schedule.${day}.endTime`) || "17:00",
    slotDuration: Number(value(formData, `schedule.${day}.slotDuration`) || value(formData, "defaultSlotDuration") || 20)
  }));
}

function payload(formData: FormData) {
  const consultationFee = Number(value(formData, "consultationFee") || 0);
  const defaultSlotDuration = Number(value(formData, "defaultSlotDuration") || 20);

  return {
    branchId: value(formData, "branchId"),
    departmentId: optionalSelect(formData, "departmentId"),
    specialtyId: optionalSelect(formData, "specialtyId"),
    displayName: value(formData, "displayName"),
    phone: value(formData, "phone") || null,
    email: value(formData, "email"),
    qualification: value(formData, "qualification") || null,
    experienceYears: Number(value(formData, "experienceYears") || 0),
    licenseNumber: value(formData, "licenseNumber"),
    bio: value(formData, "bio") || null,
    isActive: checked(formData, "isActive"),
    isAvailable: checked(formData, "isAvailable"),
    password: value(formData, "password"),
    consultationSettings: {
      consultationFee,
      followUpFee: Number(value(formData, "followUpFee") || consultationFee),
      followUpValidityDays: Number(value(formData, "followUpValidityDays") || 7),
      defaultSlotDuration,
      allowOnlineConsultation: checked(formData, "allowOnlineConsultation"),
      onlineConsultationFee: Number(value(formData, "onlineConsultationFee") || consultationFee),
      notes: value(formData, "notes") || null
    },
    schedules: schedulesPayload(formData)
  };
}

function failure(error: unknown): DoctorActionState {
  if (error instanceof z.ZodError) {
    return {
      ok: false,
      message: "Please fix the highlighted doctor details.",
      fieldErrors: error.flatten().fieldErrors
    };
  }

  return {
    ok: false,
    message: error instanceof Error ? error.message : "Doctor action failed."
  };
}

export async function createDoctorAction(formData: FormData): Promise<DoctorActionState> {
  const session = await requirePermission("doctors.create");

  try {
    const parsed: DoctorCreateInput = doctorCreateSchema.parse(payload(formData));
    await doctorService.createDoctorFromForm(parsed, session.userId);
  } catch (error) {
    return failure(error);
  }

  revalidatePath("/doctors");
  redirect("/doctors" as Route);
}

export async function updateDoctorAction(formData: FormData): Promise<DoctorActionState> {
  const session = await requirePermission("doctors.edit");

  try {
    const parsed: DoctorUpdateInput = doctorUpdateSchema.parse({
      id: value(formData, "id"),
      ...payload(formData)
    });
    await doctorService.updateDoctorFromForm(parsed, session.userId);
    revalidatePath("/doctors");
    revalidatePath(`/doctors/${parsed.id}`);
    redirect(`/doctors/${parsed.id}` as Route);
  } catch (error) {
    return failure(error);
  }
}

export async function deleteDoctorAction(formData: FormData): Promise<DoctorActionState> {
  await requirePermission("doctors.delete");
  const id = value(formData, "id");
  if (!id) return { ok: false, message: "Doctor ID is required." };

  try {
    await doctorService.deleteDoctorFromForm(id);
    revalidatePath("/doctors");
    redirect("/doctors" as Route);
  } catch (error) {
    return failure(error);
  }
}

export async function toggleDoctorStatusAction(formData: FormData): Promise<DoctorActionState> {
  await requirePermission("doctors.manage");
  const id = value(formData, "id");
  if (!id) return { ok: false, message: "Doctor ID is required." };

  try {
    await doctorService.toggleDoctorStatusFromForm(id);
    revalidatePath("/doctors");
    revalidatePath(`/doctors/${id}`);
    return { ok: true, message: "Doctor status updated." };
  } catch (error) {
    return failure(error);
  }
}
