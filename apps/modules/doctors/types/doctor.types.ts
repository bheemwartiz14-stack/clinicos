import type { DoctorDayOfWeek, DoctorSlotStatus } from "../schemas/doctor.schema";

export type DoctorSchedule = {
  id: string;
  doctorId: string;
  dayOfWeek: DoctorDayOfWeek;
  dayIndex: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DoctorAppointmentSlot = {
  id: string;
  doctorId: string;
  scheduleId: string | null;
  slotDate: string;
  startTime: string;
  endTime: string;
  status: DoctorSlotStatus;
  appointmentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DoctorConsultationSettings = {
  id: string;
  doctorId: string;
  consultationFee: string;
  followUpFee: string;
  followUpValidityDays: number;
  defaultSlotDuration: number;
  allowOnlineConsultation: boolean;
  onlineConsultationFee: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DoctorRecord = {
  id: string;
  userId: string;
  branchId: string;
  branchName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  specialtyId: string | null;
  specialtyName: string | null;
  displayName: string;
  phone: string | null;
  email: string;
  qualification: string | null;
  experienceYears: number;
  licenseNumber: string;
  bio: string | null;
  consultationFee: string;
  isActive: boolean;
  isAvailable: boolean;
  slotCount: number;
  bookedSlotCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type DoctorDetails = DoctorRecord & {
  schedules: DoctorSchedule[];
  slots: DoctorAppointmentSlot[];
  consultationSettings: DoctorConsultationSettings | null;
};

export type DoctorFormOptions = {
  branches: Array<{ id: string; name: string }>;
  departments: Array<{ id: string; name: string }>;
  specialties: Array<{ id: string; name: string }>;
};

export type DoctorSlotInsert = {
  doctorId: string;
  scheduleId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  status: "available";
};
