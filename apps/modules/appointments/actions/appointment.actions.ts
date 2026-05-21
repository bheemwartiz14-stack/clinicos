"use server";

import { revalidatePath } from "next/cache";
import type { Permission } from "@mediclinic/rbac";
import { requirePermission } from "../../../web/lib/auth";
import { appointmentService } from "../services/appointment.service";
import {
  appointmentCancelSchema,
  appointmentCheckInSchema,
  appointmentCreateSchema,
  appointmentQueueUpdateSchema,
  appointmentRescheduleSchema,
  appointmentStatusUpdateSchema
} from "../validations/appointment.validation";

export type AppointmentActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function actionError(error: unknown): AppointmentActionState {
  if (error && typeof error === "object" && "flatten" in error && typeof error.flatten === "function") {
    const flattened = error.flatten() as { fieldErrors?: Record<string, string[] | undefined> };
    return { ok: false, message: "Check the highlighted appointment fields.", fieldErrors: flattened.fieldErrors };
  }
  return { ok: false, message: error instanceof Error ? error.message : "Appointment action failed." };
}

async function requireAppointmentPermission(permission: Permission) {
  return requirePermission(permission);
}

export async function createAppointmentAction(_state: AppointmentActionState, formData: FormData): Promise<AppointmentActionState> {
  try {
    const session = await requireAppointmentPermission("appointments.create");
    const startsAt = new Date(String(formData.get("startsAt") ?? ""));
    const duration = Number(formData.get("durationMinutes") || 30);
    const endsAt = new Date(startsAt.getTime() + duration * 60_000);

    await appointmentService.create(session.branchId, appointmentCreateSchema.parse({
      patientId: formData.get("patientId"),
      doctorId: formData.get("doctorId"),
      appointmentType: formData.get("appointmentType") || "consultation",
      mode: formData.get("mode") || "offline",
      consultationMode: formData.get("consultationMode") || formData.get("mode") || "offline",
      locationType: formData.get("locationType") || "clinic",
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      reason: formData.get("reason"),
      notes: formData.get("notes") || undefined,
      symptoms: formData.get("symptoms") || undefined,
      cptCodes: String(formData.get("cptCodes") || "").split(",").map((value) => value.trim()).filter(Boolean),
      icd10Codes: String(formData.get("icd10Codes") || "").split(",").map((value) => value.trim()).filter(Boolean),
      queuePriority: formData.get("queuePriority") || "routine"
    }), session.userId);
    revalidatePath("/appointments");
    return { ok: true, message: "Appointment booked." };
  } catch (error) {
    return actionError(error);
  }
}

export async function checkInAppointmentAction(_state: AppointmentActionState, formData: FormData): Promise<AppointmentActionState> {
  try {
    const session = await requireAppointmentPermission("appointments.checkin");
    await appointmentService.checkIn(session.branchId, appointmentCheckInSchema.parse({
      appointmentId: formData.get("appointmentId"),
      priority: formData.get("priority") || "routine"
    }));
    revalidatePath("/appointments");
    return { ok: true, message: "Patient checked in and queued." };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateAppointmentStatusAction(_state: AppointmentActionState, formData: FormData): Promise<AppointmentActionState> {
  try {
    const status = String(formData.get("status") ?? "");
    const permission = status === "completed" ? "appointments.complete" : status === "cancelled" ? "appointments.cancel" : "appointments.edit";
    const session = await requireAppointmentPermission(permission);
    await appointmentService.updateStatus(session.branchId, appointmentStatusUpdateSchema.parse({
      appointmentId: formData.get("appointmentId"),
      status: formData.get("status"),
      reason: formData.get("reason") || undefined
    }), session.userId);
    revalidatePath("/appointments");
    return { ok: true, message: "Appointment status updated." };
  } catch (error) {
    return actionError(error);
  }
}

export async function rescheduleAppointmentAction(_state: AppointmentActionState, formData: FormData): Promise<AppointmentActionState> {
  try {
    const session = await requireAppointmentPermission("appointments.reschedule");
    const startsAt = new Date(String(formData.get("startsAt") ?? ""));
    const duration = Number(formData.get("durationMinutes") || 30);
    const endsAt = new Date(startsAt.getTime() + duration * 60_000);
    await appointmentService.reschedule(session.branchId, appointmentRescheduleSchema.parse({
      appointmentId: formData.get("appointmentId"),
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      reason: formData.get("reason") || "Schedule change",
      notifyPatient: formData.get("notifyPatient") ?? true
    }), session.userId);
    revalidatePath("/appointments");
    return { ok: true, message: "Appointment rescheduled." };
  } catch (error) {
    return actionError(error);
  }
}

export async function cancelAppointmentAction(_state: AppointmentActionState, formData: FormData): Promise<AppointmentActionState> {
  try {
    const session = await requireAppointmentPermission("appointments.cancel");
    await appointmentService.cancel(session.branchId, appointmentCancelSchema.parse({
      appointmentId: formData.get("appointmentId"),
      reason: formData.get("reason"),
      notifyPatient: formData.get("notifyPatient") ?? true
    }), session.userId);
    revalidatePath("/appointments");
    return { ok: true, message: "Appointment cancelled and slot released." };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateAppointmentQueueAction(_state: AppointmentActionState, formData: FormData): Promise<AppointmentActionState> {
  try {
    await requireAppointmentPermission("appointments.queue.manage");
    await appointmentService.updateQueue(appointmentQueueUpdateSchema.parse({
      appointmentId: formData.get("appointmentId"),
      queueStatus: formData.get("queueStatus")
    }));
    revalidatePath("/appointments/queue");
    return { ok: true, message: "Queue status updated." };
  } catch (error) {
    return actionError(error);
  }
}
