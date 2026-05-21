import type { AppointmentStatus, AppointmentType } from "../schemas/appointment.schema";

export type AppointmentDoctorOption = {
  id: string;
  displayName: string;
  specialty: string;
  initials: string;
  defaultDuration: number;
};

export type AppointmentPatientOption = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  email: string | null;
};

export type CalendarAppointment = {
  id: string;
  bookingNumber: string;
  patientId: string;
  patientName: string;
  patientMeta: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  type: AppointmentType;
  status: AppointmentStatus;
  reasonForVisit: string;
  notes: string | null;
  createdByName: string | null;
  cancelledReason: string | null;
  meetingUrl: string | null;
  googleMeetLink: string | null;
};

export type TimeSlot = {
  value: string;
  label: string;
};

export type AppointmentsCalendarData = {
  selectedDate: string;
  doctors: AppointmentDoctorOption[];
  patients: AppointmentPatientOption[];
  appointments: CalendarAppointment[];
  timeSlots: TimeSlot[];
  statusOptions: Array<{ value: AppointmentStatus; label: string }>;
  typeOptions: Array<{ value: AppointmentType; label: string }>;
};
