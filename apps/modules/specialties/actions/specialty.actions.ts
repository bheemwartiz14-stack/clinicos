"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { z } from "zod";
import { requirePagePermission } from "@/lib/auth";
import { specialtyService } from "../services/specialty.service";

const SPECIALTY_ROUTE = "/doctors/specialty";

const specialtySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().toUpperCase().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  departmentId: z.string().trim().min(1, "Department is required"),
  isActive: z.coerce.boolean().default(true),
});

export async function createSpecialtyAction(formData: FormData) {
  await requirePagePermission("specialties.manage");
  const parsed = specialtySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`${SPECIALTY_ROUTE}/create?error=invalid` as Route);
  await specialtyService.create(parsed.data);
  revalidatePath(SPECIALTY_ROUTE);
  redirect(SPECIALTY_ROUTE as Route);
}

export async function updateSpecialtyAction(id: string, formData: FormData) {
  await requirePagePermission("specialties.manage");
  const parsed = specialtySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`${SPECIALTY_ROUTE}/${id}/edit?error=invalid` as Route);
  await specialtyService.update(id, parsed.data);
  revalidatePath(SPECIALTY_ROUTE);
  redirect(SPECIALTY_ROUTE as Route);
}

export async function deleteSpecialtyAction(formData: FormData) {
  await requirePagePermission("specialties.manage");
  const id = String(formData.get("id") ?? "");
  if (id) {
    await specialtyService.delete(id);
  }
  revalidatePath(SPECIALTY_ROUTE);
}

export async function toggleSpecialtyAction(formData: FormData) {
  await requirePagePermission("specialties.manage");
  const id = String(formData.get("id") ?? "");
  if (id) {
    await specialtyService.toggleActive(id);
  }
  revalidatePath(SPECIALTY_ROUTE);
}
