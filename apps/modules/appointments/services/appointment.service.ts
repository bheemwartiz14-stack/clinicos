import type {
  AppointmentRecord,
  AvailableSlot,
  DoctorOption,
  CreateAppointmentInput,
  CreateRecurringInput,
  RescheduleInput,
  UpdateAppointmentInput,
  AppointmentListFilters,
} from "../types/appointment.types";
import { appointmentRepository } from "../repository/appointment.repository";
import { generateRecurringDates } from "../helpers/appointment.helpers";
import { AppointmentSyncService } from "./appointment-sync.service";

export type { AppointmentRecord, AvailableSlot, DoctorOption };

export const appointmentService = {
  async list(filters?: AppointmentListFilters): Promise<AppointmentRecord[]> {
    return appointmentRepository.findAll(filters);
  },

  async get(id: string): Promise<AppointmentRecord | null> {
    return appointmentRepository.findById(id);
  },

  async create(input: CreateAppointmentInput) {
    const maxToken = await appointmentRepository.getMaxTokenNumber(input.doctorId, input.appointmentDate);
    const nextToken = maxToken + 1;

    const created = await appointmentRepository.insert({
      patientId: input.patientId,
      doctorId: input.doctorId,
      slotId: input.slotId ?? null,
      appointmentDate: input.appointmentDate,
      startTime: input.startTime,
      endTime: input.endTime ?? null,
      type: (input.type ?? "in_clinic") as any,
      status: (input.status ?? "booked") as any,
      reason: input.reason ?? null,
      notes: input.notes ?? null,
      consultationLink: input.consultationLink ?? null,
      queueTokenNumber: nextToken,
      createdById: input.createdById ?? null,
    });
    if (input.slotId) {
      await appointmentRepository.markSlotBooked(input.slotId, true);
    }
    AppointmentSyncService.syncOnCreate(created.id).catch(() => {});
    return created;
  },

  async updateStatus(id: string, newStatus: string, changedById?: string | null, remarks?: string | null) {
    const current = await appointmentRepository.findRawById(id);
    if (!current) throw new Error("Appointment not found");

    const oldStatus = current.status;

    await appointmentRepository.updateById(id, { status: newStatus as any });
    await appointmentRepository.insertStatusLog({
      appointmentId: id,
      oldStatus: oldStatus as any,
      newStatus: newStatus as any,
      changedById: changedById ?? null,
      remarks: remarks ?? null,
    });

    if (newStatus === "cancelled") {
      if (current.slotId) {
        await appointmentRepository.markSlotBooked(current.slotId, false);
      }
      AppointmentSyncService.syncOnCancel(id).catch(() => {});
    } else if (newStatus === "completed") {
      AppointmentSyncService.syncOnDelete(id).catch(() => {});
    }
  },

  async reschedule(id: string, input: RescheduleInput) {
    const current = await appointmentRepository.findRawById(id);
    if (!current) throw new Error("Appointment not found");

    if (current.slotId) {
      await appointmentRepository.markSlotBooked(current.slotId, false);
    }

    await appointmentRepository.updateById(id, {
      appointmentDate: input.newDate,
      startTime: input.newStartTime,
      slotId: input.newSlotId ?? null,
      status: "rescheduled",
    });

    await appointmentRepository.insertRescheduleLog({
      appointmentId: id,
      oldDate: current.appointmentDate,
      oldStartTime: current.startTime,
      newDate: input.newDate,
      newStartTime: input.newStartTime,
      reason: input.reason ?? null,
      rescheduledById: input.changedById ?? null,
    });

    if (input.newSlotId) {
      await appointmentRepository.markSlotBooked(input.newSlotId, true);
    }

    AppointmentSyncService.syncOnUpdate(id).catch(() => {});
  },

  async update(id: string, input: UpdateAppointmentInput) {
    await appointmentRepository.updateById(id, {
      reason: input.reason ?? null,
      notes: input.notes ?? null,
      type: input.type as any,
    });

    AppointmentSyncService.syncOnUpdate(id).catch(() => {});
  },

  async getQueue(doctorId: string, date: string) {
    return appointmentRepository.findQueue(doctorId, date);
  },

  async createRecurring(input: CreateRecurringInput) {
    const dates = generateRecurringDates(input.appointmentDate, input.recurringEndDate, input.recurringPattern);
    const parent = await this.create({ ...input, status: "booked" });

    for (let i = 1; i < dates.length; i++) {
      await appointmentRepository.insert({
        patientId: input.patientId,
        doctorId: input.doctorId,
        slotId: input.slotId ?? null,
        appointmentDate: dates[i],
        startTime: input.startTime,
        endTime: input.endTime ?? null,
        type: (input.type ?? "in_clinic") as any,
        status: "booked",
        reason: input.reason ?? null,
        notes: input.notes ?? null,
        isRecurring: true,
        recurringPattern: input.recurringPattern as any,
        recurringEndDate: input.recurringEndDate,
        parentAppointmentId: parent.id,
        createdById: input.createdById ?? null,
      });
    }

    return parent;
  },

  async getDoctors(): Promise<DoctorOption[]> {
    return appointmentRepository.findDoctors();
  },

  async getAvailability(doctorId: string, date: string): Promise<AvailableSlot[]> {
    return appointmentRepository.findAvailableSlots(doctorId, date);
  },

  async getAllSlots(doctorId: string, date: string): Promise<AvailableSlot[]> {
    return appointmentRepository.findAllSlots(doctorId, date);
  },

  async getSlotHours(doctorId: string, date: string): Promise<string[]> {
    return appointmentRepository.getSlotHours(doctorId, date);
  },

};
