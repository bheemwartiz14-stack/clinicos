"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { staffService } from "../services/staff.service";
import { staffCreateSchema, staffUpdateSchema } from "../validations/staff.validation";
import { requirePermission } from "../../../web/lib/auth";

export type StaffActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function staffPayload(formData: FormData) {
  return {
    branchId: formValue(formData, "branchId"),
    departmentId: formValue(formData, "departmentId") || null,
    role: formValue(formData, "role"),
    name: formValue(formData, "name"),
    email: formValue(formData, "email"),
    username: formValue(formData, "username") || null,
    phone: formValue(formData, "phone") || null,
    isActive: formValue(formData, "isActive") === "true",
    shiftStart: formValue(formData, "shiftStart") || null,
    shiftEnd: formValue(formData, "shiftEnd") || null,
    password: formValue(formData, "password") || null
  };
}

function failure(error: unknown): StaffActionState {
  if (error instanceof z.ZodError) {
    return {
      ok: false,
      message: "Please fix the highlighted staff profile details.",
      fieldErrors: error.flatten().fieldErrors
    };
  }

  return {
    ok: false,
    message: error instanceof Error ? error.message : "Staff action failed."
  };
}

export async function createStaffAction(formData: FormData): Promise<StaffActionState> {
  await requirePermission("staff.manage");

  try {
    await staffService.create(staffCreateSchema.parse(staffPayload(formData)));
    revalidatePath("/settings/staff-manage");
    return { ok: true, message: "Staff member created." };
  } catch (error) {
    return failure(error);
  }
}

export async function updateStaffAction(formData: FormData): Promise<StaffActionState> {
  await requirePermission("staff.manage");

  try {
    await staffService.update(
      staffUpdateSchema.parse({
        id: formValue(formData, "id"),
        ...staffPayload(formData)
      })
    );
    revalidatePath("/settings/staff-manage");
    return { ok: true, message: "Staff member updated." };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteStaffAction(formData: FormData): Promise<StaffActionState> {
  await requirePermission("staff.manage");
  const id = formValue(formData, "id");

  if (!id) return { ok: false, message: "Staff ID is required." };

  try {
    await staffService.delete(id);
    revalidatePath("/settings/staff-manage");
    return { ok: true, message: "Staff member deleted." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Delete failed." };
  }
}
