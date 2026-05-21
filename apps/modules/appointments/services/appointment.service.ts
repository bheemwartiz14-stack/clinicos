import { appointmentCancelSchema, appointmentFormSchema, appointmentRescheduleSchema, appointmentStatusUpdateSchema, appointmentUpdateSchema, quickPatientCreateSchema, type AppointmentFormInput, type AppointmentUpdateInput } from "../schemas/appointment.schema";
import { appointmentRange, assertCanReschedule, assertCanTransition, assertFutureAppointment } from "../helpers/appointment-availability.helper";
import { generateBookingNumber } from "../helpers/booking-number.helper";
import { buildTimeSlots, initials, todayKey } from "../helpers/calendar.helper";
import * as appointmentRepository from "../repositories/appointment.repository";

async function assertDoctorCanBook(branchId: string, doctorId: string) {
  const doctors = await appointmentRepository.getActiveDoctorsForBooking(branchId);
  if (!doctors.some((doctor) => doctor.id === doctorId)) {
    throw new Error("Doctor must be active and available.");
  }
}

async function assertNoConflicts(branchId: string, input: AppointmentFormInput, excludeAppointmentId?: string) {
  const range = appointmentRange(input.appointmentDate, input.startTime, input.durationMinutes);
  assertFutureAppointment(range.startsAt);
  const conflicts = await appointmentRepository.checkAppointmentConflict({
    branchId,
    patientId: input.patientId,
    doctorId: input.doctorId,
    startsAt: range.startsAt,
    endsAt: range.endsAt,
    excludeAppointmentId
  });
  if (conflicts.doctorConflict) throw new Error("Doctor already has an overlapping appointment.");
  if (conflicts.patientConflict) throw new Error("Patient already has an overlapping appointment.");
}

export async function getAppointmentsCalendarData(branchId: string, selectedDate = todayKey()) {
  const [appointments, doctors, patients] = await Promise.all([
    appointmentRepository.getAppointmentsByDate(branchId, selectedDate),
    appointmentRepository.getActiveDoctorsForBooking(branchId),
    appointmentRepository.getPatientsForBooking(branchId)
  ]);

  return {
    selectedDate,
    doctors: doctors.map((doctor) => ({
      id: doctor.id,
      displayName: doctor.displayName,
      specialty: doctor.specialty,
      initials: initials(doctor.displayName),
      defaultDuration: doctor.defaultDuration ?? 30
    })),
    patients: patients.map((patient) => ({
      id: patient.id,
      fullName: patient.fullName,
      phone: patient.phone,
      email: patient.email,
      label: `${patient.fullName} (${patient.mrn})`
    })),
    appointments: appointments.map((appointment) => ({
      ...appointment,
      appointmentDate: appointment.appointmentDate ?? selectedDate,
      startTime: appointment.startTime ?? "09:00",
      endTime: appointment.endTime ?? "09:30",
      durationMinutes: appointment.durationMinutes ?? 30,
      type: appointment.type as "in_clinic" | "online" | "follow_up" | "emergency",
      status: appointment.status as "confirmed" | "checked_in" | "completed" | "cancelled" | "no_show"
    })),
    timeSlots: buildTimeSlots(),
    statusOptions: [
      { value: "confirmed" as const, label: "Confirmed" },
      { value: "checked_in" as const, label: "Checked In" },
      { value: "completed" as const, label: "Completed" },
      { value: "cancelled" as const, label: "Cancelled" },
      { value: "no_show" as const, label: "No Show" }
    ],
    typeOptions: [
      { value: "in_clinic" as const, label: "In Clinic" },
      { value: "online" as const, label: "Online" },
      { value: "follow_up" as const, label: "Follow Up" },
      { value: "emergency" as const, label: "Emergency" }
    ]
  };
}

export async function createAppointmentFromForm(branchId: string, userId: string, input: unknown) {
  const parsed = appointmentFormSchema.parse(input);
  await assertDoctorCanBook(branchId, parsed.doctorId);
  await assertNoConflicts(branchId, parsed);
  return appointmentRepository.createAppointment(branchId, { ...parsed, userId, bookingNumber: generateBookingNumber() });
}

export async function updateAppointmentFromForm(branchId: string, userId: string, input: unknown) {
  const parsed: AppointmentUpdateInput = appointmentUpdateSchema.parse(input);
  await assertDoctorCanBook(branchId, parsed.doctorId);
  await assertNoConflicts(branchId, parsed, parsed.id);
  return appointmentRepository.updateAppointment(branchId, { ...parsed, userId });
}

export async function cancelAppointmentFromForm(branchId: string, userId: string, input: unknown) {
  const parsed = appointmentCancelSchema.parse(input);
  const current = await appointmentRepository.getAppointmentById(branchId, parsed.id);
  if (!current) throw new Error("Appointment not found.");
  return appointmentRepository.cancelAppointment(branchId, { ...parsed, userId });
}

export async function updateAppointmentStatusFromForm(branchId: string, userId: string, input: unknown) {
  const parsed = appointmentStatusUpdateSchema.parse(input);
  const current = await appointmentRepository.getAppointmentById(branchId, parsed.id);
  if (!current) throw new Error("Appointment not found.");
  assertCanTransition(current.status, parsed.status);
  return appointmentRepository.updateAppointmentStatus(branchId, { ...parsed, userId });
}

export async function rescheduleAppointmentFromForm(branchId: string, userId: string, input: unknown) {
  const parsed = appointmentRescheduleSchema.parse(input);
  const current = await appointmentRepository.getAppointmentById(branchId, parsed.id);
  if (!current) throw new Error("Appointment not found.");
  assertCanReschedule(current.status);
  const updateInput = appointmentUpdateSchema.parse({
    id: parsed.id,
    patientId: current.patientId,
    doctorId: current.doctorId,
    appointmentDate: parsed.appointmentDate,
    startTime: parsed.startTime,
    durationMinutes: parsed.durationMinutes,
    type: current.type ?? "in_clinic",
    status: current.status,
    reasonForVisit: current.reasonForVisit ?? current.reason,
    notes: current.notes
  });
  await assertNoConflicts(branchId, updateInput, parsed.id);
  return appointmentRepository.updateAppointment(branchId, { ...updateInput, userId });
}

export async function quickCreatePatientFromForm(branchId: string, userId: string, input: unknown) {
  const parsed = quickPatientCreateSchema.parse(input);
  const patient = await appointmentRepository.quickCreatePatient(branchId, { ...parsed, createdByUserId: userId });
  return {
    id: patient.id,
    label: `${patient.fullName ?? `${patient.firstName} ${patient.lastName}`} (${patient.mrn})`
  };
}

export const appointmentService = {
  getAppointmentsCalendarData,
  createAppointmentFromForm,
  updateAppointmentFromForm,
  cancelAppointmentFromForm,
  updateAppointmentStatusFromForm,
  rescheduleAppointmentFromForm,
  quickCreatePatientFromForm,
  workspace: getAppointmentsCalendarData,
  calendar: getAppointmentsCalendarData
};
