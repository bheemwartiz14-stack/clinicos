"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { branchService } from "../services/branch.service";
import { branchUpdateSchema, branchUpsertSchema, defaultOperatingHours, type OperatingHoursInput } from "../validations/branch.validation";
import { requirePermission } from "../../../web/lib/auth";

export type BranchActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function operatingHoursFromForm(formData: FormData): OperatingHoursInput {
  return days.reduce((hours, day) => {
    hours[day] = {
      open: formValue(formData, `${day}Open`) || defaultOperatingHours[day].open,
      close: formValue(formData, `${day}Close`) || defaultOperatingHours[day].close,
      closed: formData.get(`${day}Closed`) === "on"
    };
    return hours;
  }, {} as OperatingHoursInput);
}

function branchPayloadFromForm(formData: FormData) {
  return {
    name: formValue(formData, "name"),
    npi: formValue(formData, "npi"),
    profile: formValue(formData, "profile"),
    phone: formValue(formData, "phone"),
    email: formValue(formData, "email"),
    addressLine1: formValue(formData, "addressLine1"),
    addressLine2: formValue(formData, "addressLine2"),
    city: formValue(formData, "city"),
    state: formValue(formData, "state").toUpperCase(),
    postalCode: formValue(formData, "postalCode"),
    timezone: formValue(formData, "timezone"),
    status: formValue(formData, "status"),
    isMain: formData.get("isMain") === "on",
    operatingHours: operatingHoursFromForm(formData)
  };
}

function failure(error: unknown): BranchActionState {
  if (error instanceof z.ZodError) {
    return {
      ok: false,
      message: "Please fix the highlighted branch details.",
      fieldErrors: error.flatten().fieldErrors
    };
  }

  return {
    ok: false,
    message: error instanceof Error ? error.message : "Branch action failed."
  };
}

export async function createBranchAction(formData: FormData): Promise<BranchActionState> {
  await requirePermission("branches.manage");
  try {
    await branchService.create(branchUpsertSchema.parse(branchPayloadFromForm(formData)));
    revalidatePath("/branches");
    return { ok: true, message: "Branch created." };
  } catch (error) {
    return failure(error);
  }
}

export async function updateBranchAction(formData: FormData): Promise<BranchActionState> {
  await requirePermission("branches.manage");
  try {
    await branchService.update(
      branchUpdateSchema.parse({
        id: formValue(formData, "id"),
        ...branchPayloadFromForm(formData)
      })
    );
    revalidatePath("/settings/branches");
    return { ok: true, message: "Branch updated." };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteBranchAction(formData: FormData): Promise<BranchActionState> {
  await requirePermission("branches.manage");

  try {
    const result = await branchService.remove(z.string().uuid().parse(formValue(formData, "id")));
    revalidatePath("/settings/branches");

    return {
      ok: true,
      message: result.mode === "deleted" ? "Branch deleted." : "Branch has related records, so it was marked inactive."
    };
  } catch (error) {
    return failure(error);
  }
}
