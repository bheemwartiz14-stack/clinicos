import { hashPassword } from "@mediclinic/auth";
import * as doctorRepository from "../repositories/doctor.repository";
import { doctorCreateSchema, doctorUpdateSchema, type DoctorCreateInput, type DoctorUpdateInput } from "../schemas/doctor.schema";
import { buildDoctorSlots } from "../helpers/slot-generation.helper";
import type { DoctorRecord, DoctorSchedule } from "../types/doctor.types";

function nextDateKeys(days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

export async function listDoctorsForAdmin() {
  return doctorRepository.getDoctors();
}

export async function getDoctorDetailsForAdmin(id: string) {
  return doctorRepository.getDoctorDetails(id);
}

export async function getDoctorFormOptions() {
  return doctorRepository.getDoctorFormOptions();
}

export async function createDoctorFromForm(input: DoctorCreateInput, createdBy: string) {
  const parsed = doctorCreateSchema.parse(input);
  const passwordHash = await hashPassword(parsed.password);
  const result = await doctorRepository.createDoctorWithUserAndSchedule({ ...parsed, createdBy, passwordHash });
  await generateSlotsForDoctor(result.doctor.id);
  return result.doctor;
}

export async function updateDoctorFromForm(input: DoctorUpdateInput, updatedBy: string) {
  const parsed = doctorUpdateSchema.parse(input);
  const passwordHash = parsed.password ? await hashPassword(parsed.password) : undefined;
  const result = await doctorRepository.updateDoctorWithSchedule({ ...parsed, updatedBy, passwordHash });
  await generateSlotsForDoctor(parsed.id);
  return result.doctor;
}

export async function deleteDoctorFromForm(id: string) {
  return doctorRepository.deleteDoctor(id);
}

export async function toggleDoctorStatusFromForm(id: string) {
  const doctor = await doctorRepository.toggleDoctorStatus(id);
  await generateSlotsForDoctor(id);
  return doctor;
}

export async function generateSlotsForDoctor(doctorId: string) {
  const doctor = await doctorRepository.getDoctorById(doctorId);
  if (!doctor) throw new Error("Doctor not found.");
  const schedules = await doctorRepository.getDoctorSchedules(doctorId);
  return generateSlotsForDoctorRecord(doctor, schedules);
}

async function generateSlotsForDoctorRecord(doctor: DoctorRecord, schedules: DoctorSchedule[]) {
  const existingSlotKeys = await doctorRepository.listExistingSlotKeys(doctor.id, nextDateKeys(30));
  const slots = buildDoctorSlots({ doctor, schedules, existingSlotKeys, days: 30 });
  return doctorRepository.createDoctorSlots(slots);
}

export const doctorService = {
  list: listDoctorsForAdmin,
  listDoctorsForAdmin,
  getById: doctorRepository.getDoctorById,
  getDoctorDetailsForAdmin,
  getWithDetails: getDoctorDetailsForAdmin,
  getByUserId: doctorRepository.getDoctorByUserId,
  getDoctorFormOptions,
  createDoctorFromForm,
  updateDoctorFromForm,
  deleteDoctorFromForm,
  toggleDoctorStatusFromForm,
  generateSlotsForDoctor,
  getSchedules: doctorRepository.getDoctorSchedules,
  getSlots: doctorRepository.getDoctorSlots,
  getDoctorConsultationSettings: doctorRepository.getDoctorConsultationSettings
};
