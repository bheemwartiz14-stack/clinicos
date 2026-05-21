"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "../../../web/lib/auth";
import { appointmentService } from "../services/appointment.service";

export type AppointmentActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
  patient?: { id: string; label: string };
};

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : "";
}

function appointmentPayload(formData: FormData) {
  return {
    id: value(formData, "id"),
    patientId: value(formData, "patientId"),
    doctorId: value(formData, "doctorId"),
    appointmentDate: value(formData, "appointmentDate"),
    startTime: value(formData, "startTime"),
    durationMinutes: value(formData, "durationMinutes"),
    type: value(formData, "type") || "in_clinic",
    reasonForVisit: value(formData, "reasonForVisit"),
    notes: value(formData, "notes") || null,
    status: value(formData, "status") || "confirmed"
  };
}

function actionError(error: unknown): AppointmentActionState {
  if (error instanceof z.ZodError) {
    return { ok: false, message: "Check the highlighted appointment fields.", fieldErrors: error.flatten().fieldErrors };
  }
  return { ok: false, message: error instanceof Error ? error.message : "Appointment action failed." };
}

export async function createAppointmentAction(formData: FormData): Promise<AppointmentActionState> {
  try {
    const session = await requirePermission("appointments.create");
    console.log(formData);
    await appointmentService.createAppointmentFromForm(session.branchId, session.userId, appointmentPayload(formData));
    revalidatePath("/appointments");
    return { ok: true, message: "Appointment booked." };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateAppointmentAction(formData: FormData): Promise<AppointmentActionState> {
  try {
    const session = await requirePermission("appointments.edit");
    await appointmentService.updateAppointmentFromForm(session.branchId, session.userId, appointmentPayload(formData));
    revalidatePath("/appointments");
    return { ok: true, message: "Appointment updated." };
  } catch (error) {
    return actionError(error);
  }
}

export async function cancelAppointmentAction(formData: FormData): Promise<AppointmentActionState> {
  try {
    const session = await requirePermission("appointments.cancel");
    await appointmentService.cancelAppointmentFromForm(session.branchId, session.userId, {
      id: value(formData, "id"),
      cancelledReason: value(formData, "cancelledReason")
    });
    revalidatePath("/appointments");
    return { ok: true, message: "Appointment cancelled." };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateAppointmentStatusAction(formData: FormData): Promise<AppointmentActionState> {
  try {
    const session = await requirePermission("appointments.status-update");
    await appointmentService.updateAppointmentStatusFromForm(session.branchId, session.userId, {
      id: value(formData, "id"),
      status: value(formData, "status")
    });
    revalidatePath("/appointments");
    return { ok: true, message: "Appointment status updated." };
  } catch (error) {
    return actionError(error);
  }
}

export async function rescheduleAppointmentAction(formData: FormData): Promise<AppointmentActionState> {
  try {
    const session = await requirePermission("appointments.edit");
    await appointmentService.rescheduleAppointmentFromForm(session.branchId, session.userId, {
      id: value(formData, "id"),
      appointmentDate: value(formData, "appointmentDate"),
      startTime: value(formData, "startTime"),
      durationMinutes: value(formData, "durationMinutes")
    });
    revalidatePath("/appointments");
    return { ok: true, message: "Appointment rescheduled." };
  } catch (error) {
    return actionError(error);
  }
}

export async function quickCreatePatientAction(formData: FormData): Promise<AppointmentActionState> {
  try {
    const session = await requirePermission("patients.create");
    const patient = await appointmentService.quickCreatePatientFromForm(session.branchId, session.userId, {
      fullName: value(formData, "fullName"),
      email: value(formData, "email"),
      dateOfBirth: value(formData, "dateOfBirth"),
      sex: value(formData, "sex"),
      gender: value(formData, "gender"),
      bloodGroup: value(formData, "bloodGroup"),
      maritalStatus: value(formData, "maritalStatus"),
      phone: value(formData, "phone")
    });
    revalidatePath("/appointments");
    return { ok: true, message: "Patient created.", patient };
  } catch (error) {
    return actionError(error);
  }
}
