"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { z } from "zod";
import { requirePagePermission } from "@/lib/auth";
import { patientService } from "../services/patient.service";

const patientSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z.string().trim().min(1, "Phone is required"),
  email: z.string().trim().email().optional().or(z.literal("")),
  dateOfBirth: z.string().trim().optional().or(z.literal("")),
  gender: z.string().trim().optional().or(z.literal("")),
  bloodGroup: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  emergencyContactName: z.string().trim().optional().or(z.literal("")),
  emergencyContactPhone: z.string().trim().optional().or(z.literal("")),
  allergies: z.string().trim().optional().or(z.literal("")),
  chronicDiseases: z.string().trim().optional().or(z.literal("")),
  isActive: z.coerce.boolean().default(true)
});

export async function createPatientAction(formData: FormData) {
  await requirePagePermission("patients.create");
  const parsed = patientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/patients/create?error=invalid" as Route);
  await patientService.create(parsed.data);
  revalidatePath("/patients");
  redirect("/patients" as Route);
}

export async function updatePatientAction(id: string, formData: FormData) {
  await requirePagePermission("patients.edit");
  const parsed = patientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/patients/${id}/edit?error=invalid` as Route);
  await patientService.update(id, parsed.data);
  revalidatePath("/patients");
  redirect("/patients" as Route);
}
