export type AppointmentStatus =
  | "booked"
  | "confirmed"
  | "checked_in"
  | "in_queue"
  | "in_consultation"
  | "completed"
  | "cancelled"
  | "no_show"
  | "rescheduled";

export type QueueStatus = "not_checked_in" | "waiting" | "called" | "skipped" | "completed";

export type AppointmentListItem = {
  id: string;
  appointmentNumber: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  doctorSpecialization: string | null;
  branchName: string | null;
  branchCode: string | null;
  appointmentType: string;
  status: AppointmentStatus;
  queueStatus: QueueStatus;
  tokenNumber: number | null;
  priority: string;
  startAt: Date;
  endAt: Date;
  reason: string | null;
  onlineConsultationLink: string | null;
  reminderChannel: string;
  reminderStatus: string;
  recurrenceRule: string | null;
  createdAt: Date;
};

export type CalendarSlot = {
  id: string;
  availabilitySlotId: string;
  doctorId: string;
  doctorName: string;
  branchId: string | null;
  branchName: string | null;
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
  capacity: number;
  booked: number;
  available: boolean;
};

export type AppointmentStats = {
  today: number;
  pendingConfirmation: number;
  checkedIn: number;
  onlineConsultations: number;
};

export type AppointmentOption = {
  id: string;
  label: string;
};

export type DoctorAppointmentOption = AppointmentOption & {
  specialization: string | null;
  branchId: string | null;
};

export type PatientAppointmentOption = AppointmentOption & {
  phone: string;
};

export type BranchAppointmentOption = AppointmentOption & {
  code: string;
};

export type AppointmentsPageSearchParams = {
  date?: string;
  doctorId?: string;
  status?: string;
  q?: string;
};

export type AppointmentsPageModel = {
  title: string;
  description: string;
  breadcrumb: string[];
  appointments: AppointmentListItem[];
  stats: AppointmentStats;
  selectedDate: string;
  doctorId: string;
  status: string;
  query: string;
  doctorOptions: DoctorAppointmentOption[];
  patientOptions: PatientAppointmentOption[];
  branchOptions: BranchAppointmentOption[];
  calendarSlots: CalendarSlot[];
};

export type ActionState = {
  ok: boolean;
  message: string;
};

export type CreateAppointmentInput = {
  patientId: string;
  doctorId: string;
  branchId?: string;
  appointmentType: string;
  status: AppointmentStatus;
  priority: string;
  startAt: Date;
  durationMinutes: number;
  reason?: string;
  notes?: string;
  onlineConsultationLink?: string;
  reminderChannel: string;
  recurrenceRule?: string;
  availabilitySlotId?: string;
};
