// @ts-nocheck
import type { DoctorProfile, DoctorSchedule, DoctorBreak, DoctorLeaveBlock, DoctorVisitSettings, DoctorAppointmentSlot, DoctorWithDetails } from "../types/doctor.types";

function serializeDate(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  if (typeof date === "string") return date;
  return date.toISOString();
}

export function serializeDoctor(doctor: Partial<DoctorProfile> & { updatedAt?: Date | string }): DoctorProfile {
  return {
    id: doctor.id ?? "",
    userId: doctor.userId ?? "",
    branchId: doctor.branchId ?? "",
    branchName: doctor.branchName ?? null,
    departmentId: doctor.departmentId ?? null,
    departmentName: doctor.departmentName ?? null,
    firstName: doctor.firstName ?? "",
    lastName: doctor.lastName ?? "",
    name: `${doctor.firstName ?? ""} ${doctor.lastName ?? ""}`.trim(),
    email: doctor.email ?? "",
    phone: doctor.phone ?? null,
    gender: doctor.gender ?? null,
    dateOfBirth: serializeDate(doctor.dateOfBirth),
    specialization: doctor.specialization ?? "",
    qualification: doctor.qualification ?? null,
    experienceYears: doctor.experienceYears ?? 0,
    npi: doctor.npi ?? null,
    licenseNumber: doctor.licenseNumber ?? "",
    consultationFee: doctor.consultationFee ?? "0",
    bio: doctor.bio ?? null,
    isActive: doctor.isActive ?? true,
    visitDurationMinutes: doctor.visitDurationMinutes ?? 20,
    createdAt: serializeDate(doctor.createdAt) ?? new Date().toISOString(),
    updatedAt: serializeDate(doctor.updatedAt) ?? new Date().toISOString()
  };
}

export function serializeDoctorWithDetails(doctor: Partial<DoctorWithDetails> & { updatedAt?: Date | string }): DoctorWithDetails {
  return {
    ...serializeDoctor(doctor as DoctorProfile),
    schedules: doctor.schedules ?? [],
    breaks: doctor.breaks ?? [],
    leaveBlocks: doctor.leaveBlocks ?? [],
    visitSettings: doctor.visitSettings ?? null
  };
}

export function serializeDoctorSchedule(schedule: Partial<DoctorSchedule> & { updatedAt?: Date | string }): DoctorSchedule {
  return {
    id: schedule.id ?? "",
    doctorId: schedule.doctorId ?? "",
    dayOfWeek: schedule.dayOfWeek ?? 0,
    isAvailable: schedule.isAvailable ?? false,
    startTime: schedule.startTime ?? "09:00",
    endTime: schedule.endTime ?? "17:00",
    createdAt: serializeDate(schedule.createdAt) ?? new Date().toISOString(),
    updatedAt: serializeDate(schedule.updatedAt) ?? new Date().toISOString()
  };
}

export function serializeDoctorBreak(brk: Partial<DoctorBreak> & { updatedAt?: Date | string }): DoctorBreak {
  return {
    id: brk.id ?? "",
    doctorId: brk.doctorId ?? "",
    breakType: brk.breakType ?? "lunch",
    breakName: brk.breakName ?? null,
    startTime: brk.startTime ?? "12:00",
    endTime: brk.endTime ?? "13:00",
    isEnabled: brk.isEnabled ?? true,
    createdAt: serializeDate(brk.createdAt) ?? new Date().toISOString(),
    updatedAt: serializeDate(brk.updatedAt) ?? new Date().toISOString()
  };
}

export function serializeDoctorLeaveBlock(leave: Partial<DoctorLeaveBlock> & { updatedAt?: Date | string }): DoctorLeaveBlock {
  return {
    id: leave.id ?? "",
    doctorId: leave.doctorId ?? "",
    leaveType: leave.leaveType ?? "full_day",
    fromDate: serializeDate(leave.fromDate) ?? "",
    toDate: serializeDate(leave.toDate) ?? "",
    startTime: leave.startTime ?? null,
    endTime: leave.endTime ?? null,
    reason: leave.reason ?? null,
    status: leave.status ?? "pending",
    createdAt: serializeDate(leave.createdAt) ?? new Date().toISOString(),
    updatedAt: serializeDate(leave.updatedAt) ?? new Date().toISOString()
  };
}

export function serializeDoctorVisitSettings(settings: Partial<DoctorVisitSettings> & { updatedAt?: Date | string }): DoctorVisitSettings {
  return {
    id: settings.id ?? "",
    doctorId: settings.doctorId ?? "",
    visitDurationMinutes: settings.visitDurationMinutes ?? 20,
    bufferTimeMinutes: settings.bufferTimeMinutes ?? 5,
    maxPatientsPerDay: settings.maxPatientsPerDay ?? 20,
    autoGenerateSlots: settings.autoGenerateSlots ?? true,
    allowOnlineConsultation: settings.allowOnlineConsultation ?? false,
    calendarSyncEnabled: settings.calendarSyncEnabled ?? false,
    calendarTokenExpiry: serializeDate(settings.calendarTokenExpiry),
    createdAt: serializeDate(settings.createdAt) ?? new Date().toISOString(),
    updatedAt: serializeDate(settings.updatedAt) ?? new Date().toISOString()
  };
}

export function serializeDoctorAppointmentSlot(slot: Partial<DoctorAppointmentSlot> & { updatedAt?: Date | string }): DoctorAppointmentSlot {
  return {
    id: slot.id ?? "",
    doctorId: slot.doctorId ?? "",
    slotDate: serializeDate(slot.slotDate) ?? "",
    startTime: slot.startTime ?? "09:00",
    endTime: slot.endTime ?? "09:20",
    status: slot.status ?? "available",
    appointmentId: slot.appointmentId ?? null,
    isRecurring: slot.isRecurring ?? false,
    createdAt: serializeDate(slot.createdAt) ?? new Date().toISOString(),
    updatedAt: serializeDate(slot.updatedAt) ?? new Date().toISOString()
  };
}
