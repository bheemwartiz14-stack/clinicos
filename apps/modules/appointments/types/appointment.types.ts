export type AppointmentStatus = "scheduled" | "pending" | "confirmed" | "checked_in" | "in_room" | "in_consultation" | "completed" | "cancelled" | "no_show" | "rescheduled";
export type ConsultationMode = "offline" | "online" | "hybrid";
export type AppointmentType = "consultation" | "follow_up" | "emergency" | "walk_in";
export type AppointmentPriority = "routine" | "priority" | "emergency";
export type QueueStatus = "waiting" | "called" | "in_consultation" | "skipped" | "completed";
export type SlotStatus = "available" | "booked" | "blocked" | "lunch" | "leave" | "calendar_busy" | "emergency_reserved";

export type AppointmentRecord = {
  id: string;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  patientMrn: string;
  doctorId: string;
  doctorFirstName: string;
  doctorLastName: string;
  doctorSpecialization: string;
  status: AppointmentStatus;
  consultationMode: ConsultationMode;
  startsAt: string | Date;
  endsAt: string | Date;
  reason: string;
  notes: string | null;
  queueToken: string | null;
  queuePriority: AppointmentPriority;
  checkedInAt: string | Date | null;
  googleCalendarEventId: string | null;
  googleMeetLink: string | null;
  meetingUrl: string | null;
  aiIntakeSummary: string | null;
};

export type QueueRecord = {
  id: string;
  token: string;
  priority: AppointmentPriority;
  status: string;
  checkedInAt: string | Date;
  patientFirstName: string;
  patientLastName: string;
  doctorFirstName: string;
  doctorLastName: string;
};

export type AppointmentOption = { id: string; label: string; visitDurationMinutes?: number | null };

export type SlotSuggestion = {
  startsAt: Date;
  endsAt: Date;
  status: SlotStatus;
  doctorId: string;
  reason: string;
  score: number;
};

export type AppointmentWorkspace = {
  appointments: AppointmentRecord[];
  queue: QueueRecord[];
  patients: AppointmentOption[];
  doctors: AppointmentOption[];
  suggestions: SlotSuggestion[];
};
