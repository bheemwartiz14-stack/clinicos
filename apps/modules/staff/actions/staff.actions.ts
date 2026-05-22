"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { z } from "zod";
import { requirePagePermission } from "@/lib/auth";
import { staffService } from "../services/staff.service";

const staffSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().optional().or(z.literal("")),
  username: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email(),
  phone: z.string().trim().optional().or(z.literal("")),
  password: z.string().trim().optional().or(z.literal("")),
  role: z.enum(["admin", "receptionist", "accountant"]),
  departmentId: z.string().trim().optional().or(z.literal("")),
  employeeCode: z.string().trim().optional().or(z.literal("")),
  designation: z.string().trim().optional().or(z.literal("")),
  joiningDate: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  emergencyContact: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "blocked"])
});

export async function createStaffAction(formData: FormData) {
  await requirePagePermission("staff.manage");
  const parsed = staffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/settings/staff-manage/create?error=invalid" as Route);
  await staffService.create(parsed.data);
  revalidatePath("/settings/staff-manage");
  redirect("/settings/staff-manage" as Route);
}

export async function updateStaffAction(id: string, formData: FormData) {
  await requirePagePermission("staff.manage");
  const parsed = staffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/settings/staff-manage/${id}/edit?error=invalid` as Route);
  await staffService.update(id, parsed.data);
  revalidatePath("/settings/staff-manage");
  redirect("/settings/staff-manage" as Route);
}

export async function deactivateStaffAction(formData: FormData) {
  await requirePagePermission("staff.manage");
  const id = String(formData.get("id") ?? "");
  if (id) await staffService.deactivate(id);
  revalidatePath("/settings/staff-manage");
}
