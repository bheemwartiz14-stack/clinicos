export type DoctorRecord = {
  id: string;
  userId: string;
  branchId: string;
  branchName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  specialty: string;
  licenseNumber: string;
  npi: string | null;
  experienceYears: number;
  consultationFee: string;
  visitDurationMinutes: number;
  appointmentCount: number;
  updatedAt: string;
};

export type DoctorProfile = {
  id: string;
  userId: string;
  branchId: string;
  branchName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  phone: string | null;
  gender: string | null;
  dateOfBirth: string | Date | null;
  specialization: string;
  qualification: string | null;
  experienceYears: number;
  npi: string | null;
  licenseNumber: string;
  consultationFee: string;
  bio: string | null;
  isActive: boolean;
  visitDurationMinutes: number;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type DoctorSchedule = {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type DoctorBreak = {
  id: string;
  doctorId: string;
  breakType: "lunch" | "break";
  breakName: string | null;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type DoctorLeaveBlock = {
  id: string;
  doctorId: string;
  leaveType: "full_day" | "half_day" | "custom_time";
  fromDate: string;
  toDate: string;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type DoctorVisitSettings = {
  id: string;
  doctorId: string;
  visitDurationMinutes: number;
  bufferTimeMinutes: number;
  maxPatientsPerDay: number;
  autoGenerateSlots: boolean;
  allowOnlineConsultation: boolean;
  calendarSyncEnabled: boolean;
  calendarTokenExpiry: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type DoctorAppointmentSlot = {
  id: string;
  doctorId: string;
  slotDate: string | Date;
  startTime: string;
  endTime: string;
  status: "available" | "booked" | "blocked" | "lunch" | "leave" | "calendar_busy";
  appointmentId: string | null;
  isRecurring: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type DoctorWithDetails = DoctorProfile & {
  schedules: DoctorSchedule[];
  breaks: DoctorBreak[];
  leaveBlocks: DoctorLeaveBlock[];
  visitSettings: DoctorVisitSettings | null;
};

export type DoctorAvailabilityStatus = 
  | "available" 
  | "on_leave" 
  | "on_lunch" 
  | "offline" 
  | "busy" 
  | "not_scheduled";

export type TimeSlot = {
  startTime: string;
  endTime: string;
};

export type DaySchedule = {
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
};

export type DoctorStatus = {
  status: DoctorAvailabilityStatus;
  label: string;
  color: string;
};

export type DoctorFilterInput = {
  branchId?: string;
  departmentId?: string;
  isActive?: boolean;
  search?: string;
};

export type CalendarProvider = "google" | "outlook" | "ical";
export type CalendarSyncStatus = "connected" | "disconnected" | "failed" | "expired";
export type CalendarSyncType = "manual" | "automatic" | "callback";
export type CalendarSyncLogStatus = "success" | "failed";
export type CalendarEventStatus = "busy" | "cancelled";

export type DoctorCalendarConnection = {
  id: string;
  doctorId: string;
  userId: string;
  provider: CalendarProvider;
  providerAccountEmail: string;
  accessToken: string | null;
  refreshToken: any;
  tokenType: string | null;
  scope: string | null;
  expiryDate: string | Date | null;
  calendarId: string | null; // ✅ fixed
  isConnected: boolean;
  lastSyncedAt: string | Date | null;
  syncStatus: CalendarSyncStatus;
  syncError: string | null;
  createdAt: string | Date;
  updatedAt: string | Date; // ✅ also safer
};

export type DoctorCalendarBusyEvent = {
  id: string;
  doctorId: string;
  connectionId: string;
  providerEventId: string | null;
  calendarId: string | null;
  title: string | null;
  startAt: string | Date;
  endAt: string | Date;
  isAllDay: boolean;
  status: CalendarEventStatus;
  source: CalendarProvider;
  createdAt: string | Date;
  updatedAt: string;
};

export type DoctorCalendarSyncLog = {
  id: string;
  doctorId: string;
  connectionId: string;
  syncType: CalendarSyncType;
  status: CalendarSyncLogStatus;
  message: string | null;
  startedAt: string | Date;
  completedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string;
};

export type GoogleCalendarTokens = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
};

export type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  status: string;
  transparency?: string;
};
