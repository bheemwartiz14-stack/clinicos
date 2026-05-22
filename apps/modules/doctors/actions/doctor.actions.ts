"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { z } from "zod";
import { requirePagePermission } from "@/lib/auth";
import { doctorService } from "../services/doctor.service";

const doctorSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email(),
  phone: z.string().trim().optional().or(z.literal("")),
  password: z.string().trim().optional().or(z.literal("")),
  departmentId: z.string().trim().optional().or(z.literal("")),
  specialtyId: z.string().trim().optional().or(z.literal("")),
  qualification: z.string().trim().optional().or(z.literal("")),
  experienceYears: z.coerce.number().int().min(0).optional(),
  licenseNumber: z.string().trim().optional().or(z.literal("")),
  consultationFee: z.string().trim().min(1),
  bio: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "blocked"]),
  isAvailable: z.coerce.boolean().default(false),
  createSchedule: z.coerce.boolean().default(false),
  scheduleStartTime: z.string().default("09:00"),
  scheduleEndTime: z.string().default("17:00"),
  scheduleSlotDurationMinutes: z.coerce.number().int().min(5).max(180).default(30)
});

const mondayToSaturday = [1, 2, 3, 4, 5, 6];

const scheduleSchema = z.object({
  doctorId: z.string().uuid(),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().min(4),
  endTime: z.string().min(4),
  slotDurationMinutes: z.coerce.number().int().min(5).max(180),
  isActive: z.coerce.boolean().default(false)
});

const leaveSchema = z.object({
  doctorId: z.string().uuid(),
  leaveDate: z.string().min(8),
  reason: z.string().trim().optional().or(z.literal("")),
  isFullDay: z.coerce.boolean().default(false),
  startTime: z.string().optional().or(z.literal("")),
  endTime: z.string().optional().or(z.literal(""))
});

export async function createDoctorAction(formData: FormData) {
  await requirePagePermission("doctors.manage");
  const parsed = doctorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/doctors/add?error=invalid" as Route);
  const { createSchedule, scheduleStartTime, scheduleEndTime, scheduleSlotDurationMinutes, ...doctorInput } = parsed.data;
  const result = await doctorService.create({
    ...doctorInput,
    initialSchedules: createSchedule
      ? mondayToSaturday.map((dayOfWeek) => ({
          dayOfWeek,
          startTime: scheduleStartTime,
          endTime: scheduleEndTime,
          slotDurationMinutes: scheduleSlotDurationMinutes,
          isActive: true
        }))
      : null
  });
  revalidatePath("/doctors");
  redirect(`/doctors?created=1&password=${encodeURIComponent(result.temporaryPassword)}` as Route);
}

export async function updateDoctorAction(id: string, formData: FormData) {
  await requirePagePermission("doctors.manage");
  const parsed = doctorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/doctors/${id}/edit?error=invalid` as Route);
  const { createSchedule, scheduleStartTime, scheduleEndTime, scheduleSlotDurationMinutes, ...doctorInput } = parsed.data;
  await doctorService.update(id, doctorInput);
  revalidatePath("/doctors");
  redirect("/doctors" as Route);
}

export async function deactivateDoctorAction(formData: FormData) {
  await requirePagePermission("doctors.manage");
  const id = String(formData.get("id") ?? "");
  if (id) await doctorService.deactivate(id);
  revalidatePath("/doctors");
}

export async function addScheduleAction(formData: FormData) {
  await requirePagePermission("doctors.manage");
  const parsed = scheduleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { doctorId, ...input } = parsed.data;
  await doctorService.addSchedule(doctorId, input);
  revalidatePath(`/doctors/${doctorId}`);
}

export async function addLeaveAction(formData: FormData) {
  await requirePagePermission("doctors.manage");
  const parsed = leaveSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { doctorId, ...input } = parsed.data;
  await doctorService.addLeave(doctorId, input);
  revalidatePath(`/doctors/${doctorId}`);
}
