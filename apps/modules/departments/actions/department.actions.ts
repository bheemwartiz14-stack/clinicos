"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { departmentService } from "../services/department.service";
import { departmentUpdateSchema, departmentUpsertSchema, type DepartmentUpsertInput } from "../validations/department.validation";
import { requirePermission } from "../../../web/lib/auth";

export type DepartmentActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function departmentPayload(formData: FormData): DepartmentUpsertInput {
  return {
    branchId: formValue(formData, "branchId"),
    name: formValue(formData, "name"),
    code: formValue(formData, "code") || null,
    description: formValue(formData, "description"),
    status: formValue(formData, "status") as "active" | "inactive",
    headId: formValue(formData, "headId") || null
  };
}

function failure(error: unknown): DepartmentActionState {
  if (error instanceof z.ZodError) {
    return {
      ok: false,
      message: "Please fix the highlighted department details.",
      fieldErrors: error.flatten().fieldErrors
    };
  }

  return {
    ok: false,
    message: error instanceof Error ? error.message : "Department action failed."
  };
}

export async function createDepartmentAction(formData: FormData): Promise<DepartmentActionState> {
  await requirePermission("departments.manage");

  try {
    await departmentService.create(departmentUpsertSchema.parse(departmentPayload(formData)));
    revalidatePath("/settings/departments");
    return { ok: true, message: "Department created." };
  } catch (error) {
    return failure(error);
  }
}

export async function updateDepartmentAction(formData: FormData): Promise<DepartmentActionState> {
  await requirePermission("departments.manage");

  try {
    await departmentService.update(
      departmentUpdateSchema.parse({
        id: formValue(formData, "id"),
        ...departmentPayload(formData)
      })
    );
    revalidatePath("/settings/departments");
    return { ok: true, message: "Department updated." };
  } catch (error) {
    return failure(error);
  }
}
