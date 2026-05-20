import * as doctorRepo from "../repositories/doctor.repository";
import type {
  DoctorProfile,
  DoctorWithDetails,
  DoctorSchedule,
  DoctorBreak,
  DoctorLeaveBlock,
  DoctorVisitSettings,
  DoctorAppointmentSlot,
  DoctorFilterInput
} from "../types/doctor.types";

export const doctorService = {
  async list(filter?: DoctorFilterInput) {
    return doctorRepo.listDoctors(filter);
  },

  async listWithCounts() {
    return doctorRepo.listDoctorsWithCounts();
  },

  async getById(id: string) {
    return doctorRepo.getDoctorById(id);
  },

  async getWithDetails(id: string) {
    return doctorRepo.getDoctorWithDetails(id);
  },

  async getByUserId(userId: string) {
    return doctorRepo.getDoctorByUserId(userId);
  },

  async create(data: Parameters<typeof doctorRepo.createDoctor>[0]) {
    return doctorRepo.createDoctor(data);
  },

  async update(id: string, data: Parameters<typeof doctorRepo.updateDoctor>[1]) {
    return doctorRepo.updateDoctor(id, data);
  },

  async delete(id: string) {
    return doctorRepo.deleteDoctor(id);
  },

  async getSchedules(doctorId: string): Promise<DoctorSchedule[]> {
    return doctorRepo.getDoctorSchedules(doctorId);
  },

  async updateSchedules(doctorId: string, schedules: Parameters<typeof doctorRepo.upsertDoctorSchedules>[1]) {
    return doctorRepo.upsertDoctorSchedules(doctorId, schedules);
  },

  async getBreaks(doctorId: string): Promise<DoctorBreak[]> {
    return doctorRepo.getDoctorBreaks(doctorId);
  },

  async updateBreaks(doctorId: string, breaks: Parameters<typeof doctorRepo.upsertDoctorBreaks>[1]) {
    return doctorRepo.upsertDoctorBreaks(doctorId, breaks);
  },

  async getLeaveBlocks(doctorId: string): Promise<DoctorLeaveBlock[]> {
    return doctorRepo.getDoctorLeaveBlocks(doctorId);
  },

  async createLeaveBlock(data: Parameters<typeof doctorRepo.createDoctorLeaveBlock>[0]) {
    return doctorRepo.createDoctorLeaveBlock(data);
  },

  async updateLeaveBlock(id: string, data: Parameters<typeof doctorRepo.updateDoctorLeaveBlock>[1]) {
    return doctorRepo.updateDoctorLeaveBlock(id, data);
  },

  async deleteLeaveBlock(id: string) {
    return doctorRepo.deleteDoctorLeaveBlock(id);
  },

  async getVisitSettings(doctorId: string): Promise<DoctorVisitSettings | null> {
    return doctorRepo.getDoctorVisitSettings(doctorId);
  },

  async updateVisitSettings(doctorId: string, data: Parameters<typeof doctorRepo.updateDoctorVisitSettings>[1]) {
    return doctorRepo.updateDoctorVisitSettings(doctorId, data);
  },

  async getSlots(doctorId: string, date: Date): Promise<DoctorAppointmentSlot[]> {
    return doctorRepo.getDoctorSlots(doctorId, date);
  },

  async getSlotsInRange(doctorId: string, startDate: Date, endDate: Date): Promise<DoctorAppointmentSlot[]> {
    return doctorRepo.getDoctorSlotsInRange(doctorId, startDate, endDate);
  },

  async deleteSlotsInRange(doctorId: string, startDate: Date, endDate: Date) {
    return doctorRepo.deleteDoctorSlotsInRange(doctorId, startDate, endDate);
  },

  async createSlots(slots: Parameters<typeof doctorRepo.createDoctorSlots>[0]) {
    return doctorRepo.createDoctorSlots(slots);
  },

  async getActiveByBranch(branchId: string) {
    return doctorRepo.getActiveDoctorsByBranch(branchId);
  },

  async getAppointmentCount(doctorId: string) {
    return doctorRepo.getDoctorAppointmentCount(doctorId);
  }
};