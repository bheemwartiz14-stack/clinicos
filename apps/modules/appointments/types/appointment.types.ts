import type { appointments, patients, doctors, users, doctorSpecialties } from "@mediclinic/db";

export type AppointmentRecord = {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string | null;
  slotId: string | null;
  appointmentDate: string;
  startTime: string;
  endTime: string | null;
  type: string;
  status: string;
  reason: string | null;
  notes: string | null;
  queueTokenNumber: number | null;
  createdById: string | null;
};

export type AvailableSlot = {
  id: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string | null;
  isBooked: boolean;
};

export type DoctorOption = {
  id: string;
  name: string;
  specialty: string | null;
};

export type QueueItem = {
  id: string;
  tokenNumber: number | null;
  patientName: string;
  startTime: string;
  status: string;
};

export type CreateAppointmentInput = {
  patientId: string;
  doctorId: string;
  slotId?: string | null;
  appointmentDate: string;
  startTime: string;
  endTime?: string | null;
  type?: string;
  status?: string;
  reason?: string | null;
  notes?: string | null;
  consultationLink?: string | null;
  createdById?: string | null;
};

export type CreateRecurringInput = CreateAppointmentInput & {
  recurringPattern: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly";
  recurringEndDate: string;
};

export type RescheduleInput = {
  newDate: string;
  newStartTime: string;
  newSlotId?: string | null;
  reason?: string | null;
  changedById?: string | null;
};

export type UpdateAppointmentInput = {
  reason?: string | null;
  notes?: string | null;
  type?: string;
};

export type AppointmentListFilters = {
  date?: string;
  doctorId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type AppointmentJoinRow = {
  appointment: typeof appointments.$inferSelect;
  patient: typeof patients.$inferSelect;
  doctor: typeof doctors.$inferSelect;
  user: typeof users.$inferSelect;
  specialty: typeof doctorSpecialties.$inferSelect | null;
};

export type BookingInput = {
  patientId: string;
  doctorId: string;
  slotId?: string | null;
  appointmentDate: string;
  startTime: string;
  endTime?: string | null;
  type?: string;
  reason?: string | null;
  notes?: string | null;
  createdById?: string | null;
};

export type BookingResult = {
  success: true;
  appointmentId: string;
  googleEventId: string | null;
  meetingLink: string | null;
  notificationsSent: number;
  emailsSent: number;
};

export type BookingErrorResult = {
  success: false;
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type AppointmentLog = {
  id: string;
  appointmentId: string;
  action: string;
  message: string | null;
  performedBy: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
};

export type AppointmentLogFilters = {
  appointmentId?: string;
  action?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
};

export type PaginatedAppointmentLogsResponse = {
  logs: AppointmentLog[];
  total: number;
  page: number;
  limit: number;
};

export const APPOINTMENT_LOG_ACTIONS = {
  BOOKED: "BOOKED",
  UPDATED: "UPDATED",
  RESCHEDULED: "RESCHEDULED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  NO_SHOW: "NO_SHOW",
  CALENDAR_CREATED: "CALENDAR_CREATED",
  CALENDAR_UPDATED: "CALENDAR_UPDATED",
  EMAIL_SENT: "EMAIL_SENT",
  NOTIFICATION_SENT: "NOTIFICATION_SENT",
} as const;
