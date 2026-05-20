"use server";

import { redirect } from "next/navigation";
import type { Route } from "next";
import { can, type Permission, type Role } from "@mediclinic/rbac";
import { getSession } from "../../../web/lib/auth";
import { doctorService } from "../services/doctor.service";
import { generateAppointmentSlots, getDoctorAvailabilityStatus } from "../utils/doctor.utils";
import {
  doctorCreateSchema,
  doctorUpdateSchema,
  weeklyScheduleSchema,
  breakUpdateSchema,
  visitSettingsSchema,
  leaveBlockCreateSchema,
  leaveBlockUpdateSchema,
  slotGenerationSchema
} from "../validations/doctor.validation";
import { serializeDoctor, serializeDoctorWithDetails } from "../utils/serialize-doctor";
import { db } from "@mediclinic/db";
import { eq, and, gte, lte } from "drizzle-orm";
import { doctorAppointmentSlots, doctorLeaveBlocks } from "@mediclinic/db";

export type DoctorActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

async function checkPermission(permission: Permission) {
  const session = await getSession();
  if (!session || !can(session.role, permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }
  return session;
}

async function checkDoctorSelfPermission(doctorId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  
  if (can(session.role, "doctors.edit") || can(session.role, "doctors.self.manage")) {
    if (session.role === "doctor" && session.userId) {
      const doctor = await doctorService.getByUserId(session.userId);
      if (!doctor || doctor.id !== doctorId) {
        throw new Error("You can only manage your own profile");
      }
    }
  } else {
    throw new Error(`Permission denied`);
  }
  
  return session;
}

export async function createDoctorAction(_state: DoctorActionState, formData: FormData): Promise<DoctorActionState> {
  try {
    await checkPermission("doctors.create");
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Permission denied" };
  }

  const parsed = doctorCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return { ok: false, message: "Validation failed", fieldErrors };
  }

  try {
    await doctorService.create(parsed.data);
    return { ok: true, message: "Doctor created successfully" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to create doctor" };
  }
}

export async function updateDoctorAction(_state: DoctorActionState, formData: FormData): Promise<DoctorActionState> {
  const id = formData.get("id") as string;
  if (!id) {
    return { ok: false, message: "Doctor ID is required" };
  }

  try {
    await checkDoctorSelfPermission(id);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Permission denied" };
  }

  const parsed = doctorUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return { ok: false, message: "Validation failed", fieldErrors };
  }

  try {
    await doctorService.update(id, parsed.data);
    return { ok: true, message: "Doctor updated successfully" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to update doctor" };
  }
}

export async function deleteDoctorAction(id: string): Promise<DoctorActionState> {
  try {
    await checkPermission("doctors.delete");
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Permission denied" };
  }

  try {
    await doctorService.delete(id);
    return { ok: true, message: "Doctor deleted successfully" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to delete doctor" };
  }
}

export async function updateScheduleAction(_state: DoctorActionState, formData: FormData): Promise<DoctorActionState> {
  const doctorId = formData.get("doctorId") as string;
  if (!doctorId) {
    return { ok: false, message: "Doctor ID is required" };
  }

  try {
    await checkDoctorSelfPermission(doctorId);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Permission denied" };
  }

  const schedules = [];
  for (let day = 0; day < 7; day++) {
    schedules.push({
      dayOfWeek: day,
      isAvailable: formData.get(`isAvailable_${day}`) === "true",
      startTime: formData.get(`startTime_${day}`) as string || "09:00",
      endTime: formData.get(`endTime_${day}`) as string || "17:00"
    });
  }

  const parsed = weeklyScheduleSchema.safeParse({ doctorId, schedules });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid schedule" };
  }

  try {
    await doctorService.updateSchedules(doctorId, parsed.data.schedules);
    return { ok: true, message: "Schedule updated successfully" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to update schedule" };
  }
}

export async function updateBreaksAction(_state: DoctorActionState, formData: FormData): Promise<DoctorActionState> {
  const doctorId = formData.get("doctorId") as string;
  if (!doctorId) {
    return { ok: false, message: "Doctor ID is required" };
  }

  try {
    await checkDoctorSelfPermission(doctorId);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Permission denied" };
  }

  const breaks: Array<{
    id?: string;
    breakType: string;
    breakName: string | null;
    startTime: string;
    endTime: string;
    isEnabled: boolean;
  }> = [];

  const breakTypes = ["lunch", "break"];
  for (const breakType of breakTypes) {
    const isEnabled = formData.get(`breakEnabled_${breakType}`) === "true";
    if (isEnabled) {
      breaks.push({
        breakType,
        breakName: breakType === "lunch" ? "Lunch Break" : "Short Break",
        startTime: formData.get(`breakStart_${breakType}`) as string || "12:00",
        endTime: formData.get(`breakEnd_${breakType}`) as string || "13:00",
        isEnabled: true
      });
    }
  }

  const parsed = breakUpdateSchema.safeParse({ doctorId, breaks });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid break data" };
  }

  try {
    const breaks = parsed.data.breaks.map((b) => ({
      ...b,
      breakName: b.breakName ?? null
    }));
    await doctorService.updateBreaks(doctorId, breaks);
    return { ok: true, message: "Breaks updated successfully" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to update breaks" };
  }
}

export async function updateVisitSettingsAction(_state: DoctorActionState, formData: FormData): Promise<DoctorActionState> {
  const doctorId = formData.get("doctorId") as string;
  const regenerateSlots = formData.get("regenerateSlots") === "true";
  if (!doctorId) {
    return { ok: false, message: "Doctor ID is required" };
  }

  try {
    await checkDoctorSelfPermission(doctorId);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Permission denied" };
  }

  const parsed = visitSettingsSchema.safeParse({
    doctorId,
    visitDurationMinutes: Number(formData.get("visitDurationMinutes")),
    bufferTimeMinutes: Number(formData.get("bufferTimeMinutes")),
    maxPatientsPerDay: Number(formData.get("maxPatientsPerDay")),
    autoGenerateSlots: formData.get("autoGenerateSlots") === "true",
    allowOnlineConsultation: formData.get("allowOnlineConsultation") === "true"
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid settings" };
  }

  try {
    await doctorService.updateVisitSettings(doctorId, parsed.data);

    if (regenerateSlots) {
      const [schedules, breaks, leaveBlocks, visitSettings, existingSlots] = await Promise.all([
        doctorService.getSchedules(doctorId),
        doctorService.getBreaks(doctorId),
        doctorService.getLeaveBlocks(doctorId),
        doctorService.getVisitSettings(doctorId),
        doctorService.getSlotsInRange(doctorId, new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
      ]);

      let slotsCount = 0;
      if (visitSettings) {
        await doctorService.deleteSlotsInRange(doctorId, new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
        
        const newSlots = generateAppointmentSlots(
          doctorId,
          new Date(),
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          schedules,
          breaks,
          leaveBlocks,
          visitSettings,
          existingSlots
        );

        if (newSlots.length > 0) {
          await doctorService.createSlots(newSlots);
          slotsCount = newSlots.length;
        }
      }

      return { ok: true, message: `Settings updated and ${slotsCount} slots regenerated successfully` };
    }

    return { ok: true, message: "Settings updated successfully" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to update settings" };
  }
}

export async function createLeaveBlockAction(_state: DoctorActionState, formData: FormData): Promise<DoctorActionState> {
  const doctorId = formData.get("doctorId") as string;
  if (!doctorId) {
    return { ok: false, message: "Doctor ID is required" };
  }

  try {
    await checkDoctorSelfPermission(doctorId);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Permission denied" };
  }

  const parsed = leaveBlockCreateSchema.safeParse({
    doctorId,
    leaveType: formData.get("leaveType"),
    fromDate: formData.get("fromDate"),
    toDate: formData.get("toDate"),
    startTime: formData.get("startTime") || null,
    endTime: formData.get("endTime") || null,
    reason: formData.get("reason") || null
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid leave data" };
  }

  try {
    await doctorService.createLeaveBlock(parsed.data);
    return { ok: true, message: "Leave request created successfully" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to create leave request" };
  }
}

export async function updateLeaveBlockAction(_state: DoctorActionState, formData: FormData): Promise<DoctorActionState> {
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  if (!id) {
    return { ok: false, message: "Leave ID is required" };
  }

  try {
    const session = await checkPermission("doctors.leave.manage");
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Permission denied" };
  }

  try {
    await doctorService.updateLeaveBlock(id, { status });
    return { ok: true, message: "Leave status updated successfully" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to update leave status" };
  }
}

export async function deleteLeaveBlockAction(id: string): Promise<DoctorActionState> {
  try {
    await doctorService.deleteLeaveBlock(id);
    return { ok: true, message: "Leave request deleted successfully" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to delete leave request" };
  }
}

export async function generateSlotsAction(_state: DoctorActionState, formData: FormData): Promise<DoctorActionState> {
  const doctorId = formData.get("doctorId") as string;
  if (!doctorId) {
    return { ok: false, message: "Doctor ID is required" };
  }

  try {
    await checkDoctorSelfPermission(doctorId);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Permission denied" };
  }

  const parsed = slotGenerationSchema.safeParse({
    doctorId,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate")
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid date range" };
  }

  try {
    const [schedules, breaks, leaveBlocks, visitSettings, existingSlots] = await Promise.all([
      doctorService.getSchedules(doctorId),
      doctorService.getBreaks(doctorId),
      doctorService.getLeaveBlocks(doctorId),
      doctorService.getVisitSettings(doctorId),
      doctorService.getSlotsInRange(doctorId, parsed.data.startDate, parsed.data.endDate)
    ]);

    if (!visitSettings) {
      return { ok: false, message: "Visit settings not configured" };
    }

    const newSlots = generateAppointmentSlots(
      doctorId,
      parsed.data.startDate,
      parsed.data.endDate,
      schedules,
      breaks,
      leaveBlocks,
      visitSettings,
      existingSlots
    );

    if (newSlots.length > 0) {
      await doctorService.createSlots(newSlots);
    }

    return { ok: true, message: `Generated ${newSlots.length} slots successfully` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Failed to generate slots" };
  }
}

export async function getDoctorAvailabilityAction(doctorId: string) {
  try {
    const [schedules, breaks, leaveBlocks, visitSettings, slots] = await Promise.all([
      doctorService.getSchedules(doctorId),
      doctorService.getBreaks(doctorId),
      doctorService.getLeaveBlocks(doctorId),
      doctorService.getVisitSettings(doctorId),
      doctorService.getSlots(doctorId, new Date())
    ]);

    return getDoctorAvailabilityStatus(schedules, breaks, leaveBlocks, visitSettings, slots);
  } catch (error) {
    return { status: "offline" as const, label: "Unknown", color: "text-gray-500" };
  }
}