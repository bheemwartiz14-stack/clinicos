import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { getCurrentUser } from "@/modules/auth/auth.service";
import { hasPermission } from "@/modules/auth/permissions";
import { createActivityLog } from "../setting/audit-logs/hooks/audit-logs.logger";
import { getAppointmentsPageModel } from "./appointments.model";
import {
  createAppointment,
  findAppointmentBranches,
  findAppointmentDoctors,
  findAppointmentPatients,
  findAppointments,
  findCalendarSlots,
  getAppointmentStats,
  updateAppointmentFlow,
} from "./appointments.repository";
import type { ActionState, AppointmentsPageSearchParams } from "./appointments.types";
import { createAppointmentSchema, updateAppointmentFlowSchema } from "./appointments.validation";

const APPOINTMENTS_PATH = "/appointments";

async function requireAppointmentsPermission(
  permission:
    | "appointments.view"
    | "appointments.create"
    | "appointments.edit"
    | "appointments.delete",
) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role !== "admin" && !hasPermission(user.permissions, permission)) {
    redirect("/dashboard");
  }

  return user;
}

function emptyToUndefined(value: FormDataEntryValue | null) {
  const stringValue = String(value ?? "").trim();
  return stringValue.length > 0 ? stringValue : undefined;
}

function parseAppointmentForm(formData: FormData) {
  const date = String(formData.get("appointmentDate") ?? "");
  const time = String(formData.get("appointmentTime") ?? "");

  return {
    appointmentType: formData.get("appointmentType"),
    availabilitySlotId: emptyToUndefined(formData.get("availabilitySlotId")),
    branchId: emptyToUndefined(formData.get("branchId")),
    doctorId: formData.get("doctorId"),
    durationMinutes: formData.get("durationMinutes"),
    notes: emptyToUndefined(formData.get("notes")),
    onlineConsultationLink: emptyToUndefined(formData.get("onlineConsultationLink")),
    patientId: formData.get("patientId"),
    priority: formData.get("priority"),
    reason: emptyToUndefined(formData.get("reason")),
    recurrenceRule: emptyToUndefined(formData.get("recurrenceRule")),
    reminderChannel: formData.get("reminderChannel"),
    startAt: date && time ? new Date(`${date}T${time}:00`) : undefined,
    status: formData.get("status"),
  };
}

function parseFlowForm(formData: FormData) {
  return {
    appointmentId: formData.get("appointmentId"),
    queueStatus: formData.get("queueStatus"),
    status: formData.get("status"),
  };
}

function actionError(error: unknown, fallback: string): ActionState {
  if (error instanceof ZodError) {
    return {
      ok: false,
      message: error.issues[0]?.message ?? "Please check the appointment details.",
    };
  }

  if (error instanceof Error) {
    return { ok: false, message: error.message || fallback };
  }

  return { ok: false, message: fallback };
}

function getUserDisplayName(user: {
  email?: string | null;
  fullName?: string | null;
  name?: string | null;
}) {
  return user.name ?? user.fullName ?? user.email ?? "Unknown user";
}

export async function getAppointmentsPageData(searchParams: Promise<AppointmentsPageSearchParams>) {
  await requireAppointmentsPermission("appointments.view");
  const filters = await searchParams;
  const selectedDate = filters.date || new Date().toISOString().slice(0, 10);
  const [appointments, stats, doctorOptions, patientOptions, branchOptions, calendarSlots] =
    await Promise.all([
      findAppointments({ ...filters, date: selectedDate }),
      getAppointmentStats(selectedDate),
      findAppointmentDoctors(),
      findAppointmentPatients(),
      findAppointmentBranches(),
      findCalendarSlots({ date: selectedDate, doctorId: filters.doctorId }),
    ]);

  return getAppointmentsPageModel({
    appointments,
    branchOptions,
    calendarSlots,
    doctorId: filters.doctorId ?? "",
    doctorOptions,
    patientOptions,
    query: filters.q ?? "",
    selectedDate,
    stats,
    status: filters.status ?? "",
  });
}

export async function createAppointmentFromForm(formData: FormData): Promise<ActionState> {
  const user = await requireAppointmentsPermission("appointments.create");

  try {
    if (formData.get("_intent") === "update-flow") {
      if (user.role !== "admin" && !hasPermission(user.permissions, "appointments.edit")) {
        redirect("/dashboard");
      }

      const input = updateAppointmentFlowSchema.parse(parseFlowForm(formData));
      const appointment = await updateAppointmentFlow({
        ...input,
        changedById: user.id,
      });

      await createActivityLog({
        action: "UPDATE_APPOINTMENT_FLOW",
        description: `Updated appointment ${appointment.appointmentNumber} flow`,
        ipAddress: "",
        metadata: {
          appointmentId: appointment.id,
          queueStatus: appointment.queueStatus,
          status: appointment.status,
        },
        module: "appointments",
        userId: user.id,
        userName: getUserDisplayName(user),
      });

      revalidatePath(APPOINTMENTS_PATH);
      return { ok: true, message: "Appointment flow updated." };
    }

    const input = createAppointmentSchema.parse(parseAppointmentForm(formData));
    const appointment = await createAppointment(
      {
        ...input,
        onlineConsultationLink: input.onlineConsultationLink || undefined,
      },
      user.id,
    );

    if (!appointment) {
      return { ok: false, message: "Unable to create appointment." };
    }

    await createActivityLog({
      action: "CREATE_APPOINTMENT",
      description: `Created appointment ${appointment.appointmentNumber}`,
      ipAddress: "",
      metadata: {
        appointmentId: appointment.id,
        appointmentNumber: appointment.appointmentNumber,
      },
      module: "appointments",
      userId: user.id,
      userName: getUserDisplayName(user),
    });

    revalidatePath(APPOINTMENTS_PATH);
    return { ok: true, message: "Appointment created successfully." };
  } catch (error) {
    return actionError(error, "Unable to create appointment. Please try again.");
  }
}
