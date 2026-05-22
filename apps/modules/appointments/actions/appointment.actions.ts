"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { z } from "zod";
import { requirePagePermission } from "@/lib/auth";
import { getSession } from "@/lib/auth";
import { appointmentService } from "../services/appointment.service";

const createAppointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  slotId: z.string().optional().or(z.literal("")),
  appointmentDate: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Time is required"),
  endTime: z.string().optional().or(z.literal("")),
  type: z.enum(["in_clinic", "online", "walk_in"]).default("in_clinic"),
  status: z.enum(["booked", "confirmed", "pending", "cancelled"]).default("confirmed"),
  reason: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export async function createAppointmentAction(formData: FormData) {
  await requirePagePermission("appointments.create");
  const parsed = createAppointmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/appointments/create?error=invalid" as Route);

  const session = await getSession().catch(() => null);

  await appointmentService.create({
    ...parsed.data,
    slotId: parsed.data.slotId || null,
    endTime: parsed.data.endTime || null,
    reason: parsed.data.reason || null,
    notes: parsed.data.notes || null,
    createdById: session?.userId ?? null,
  });

  revalidatePath("/appointments");
  redirect("/appointments" as Route);
}

const updateStatusSchema = z.object({
  appointmentId: z.string().min(1),
  newStatus: z.enum(["booked", "confirmed", "checked_in", "in_consultation", "completed", "cancelled", "rescheduled", "no_show"]),
  remarks: z.string().optional().or(z.literal("")),
});

export async function updateAppointmentStatusAction(formData: FormData) {
  await requirePagePermission("appointments.edit");
  const parsed = updateStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const session = await getSession().catch(() => null);

  await appointmentService.updateStatus(
    parsed.data.appointmentId,
    parsed.data.newStatus,
    session?.userId ?? null,
    parsed.data.remarks || null
  );

  revalidatePath("/appointments");
}

const rescheduleSchema = z.object({
  appointmentId: z.string().min(1),
  newDate: z.string().min(1, "New date is required"),
  newStartTime: z.string().min(1, "New time is required"),
  newSlotId: z.string().optional().or(z.literal("")),
  reason: z.string().optional().or(z.literal("")),
});

export async function rescheduleAppointmentAction(formData: FormData) {
  await requirePagePermission("appointments.edit");
  const parsed = rescheduleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const session = await getSession().catch(() => null);

  await appointmentService.reschedule(parsed.data.appointmentId, {
    newDate: parsed.data.newDate,
    newStartTime: parsed.data.newStartTime,
    newSlotId: parsed.data.newSlotId || null,
    reason: parsed.data.reason || null,
    changedById: session?.userId ?? null,
  });

  revalidatePath("/appointments");
}

export async function walkInAppointmentAction(formData: FormData) {
  await requirePagePermission("appointments.create");
  const parsed = createAppointmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/appointments/create?error=invalid" as Route);

  const session = await getSession().catch(() => null);

  await appointmentService.create({
    ...parsed.data,
    slotId: parsed.data.slotId || null,
    endTime: parsed.data.endTime || null,
    reason: parsed.data.reason || null,
    notes: parsed.data.notes || null,
    type: "walk_in",
    status: "checked_in",
    createdById: session?.userId ?? null,
  });

  revalidatePath("/appointments");
  redirect("/appointments" as Route);
}
