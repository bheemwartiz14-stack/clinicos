"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { requirePagePermission, getSession } from "@/lib/auth";
import { appointmentService } from "../services/appointment.service";
import { createAppointmentSchema, updateStatusSchema, rescheduleSchema } from "../validations/appointment.validation";

export async function createAppointmentAction(formData: FormData) {
  await requirePagePermission("appointments.create");
  const parsed = createAppointmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/appointments/create?error=invalid" as Route);

  const session = await getSession().catch(() => null);
  const safeData = parsed.data;

  await appointmentService.create({
    patientId: safeData.patientId,
    doctorId: safeData.doctorId,
    slotId: safeData.slotId || null,
    appointmentDate: safeData.appointmentDate,
    startTime: safeData.startTime,
    endTime: safeData.endTime || null,
    type: safeData.type,
    status: safeData.status,
    reason: safeData.reason || null,
    notes: safeData.notes || null,
    createdById: session?.userId ?? null,
  });

  revalidatePath("/appointments");
  redirect("/appointments" as Route);
}

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

export async function createRecurringAppointmentAction(formData: FormData) {
  await requirePagePermission("appointments.create");
  const parsed = createAppointmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/appointments/create?error=invalid` as Route);

  const session = await getSession().catch(() => null);
  const data = parsed.data;

  if (!data.recurringPattern || !data.recurringEndDate) {
    throw new Error("Recurring pattern and end date are required");
  }

  await appointmentService.createRecurring({
    patientId: data.patientId,
    doctorId: data.doctorId,
    slotId: data.slotId || null,
    appointmentDate: data.appointmentDate,
    startTime: data.startTime,
    endTime: data.endTime || null,
    type: data.type,
    reason: data.reason || null,
    notes: data.notes || null,
    createdById: session?.userId ?? null,
    recurringPattern: data.recurringPattern,
    recurringEndDate: data.recurringEndDate,
  });

  revalidatePath("/appointments");
  redirect("/appointments" as Route);
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
