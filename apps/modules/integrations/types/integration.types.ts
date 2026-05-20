export type IntegrationProvider = "google_calendar" | "google_meet";
export type IntegrationStatus = "connected" | "disconnected" | "failed" | "expired";
export type ConsultationMode = "offline" | "online" | "hybrid";

export type DoctorIntegrationRecord = {
  id: string;
  doctorId: string;
  userId: string;
  provider: IntegrationProvider;
  providerAccountEmail: string;
  tokenType: string | null;
  scope: string | null;
  expiryDate: string | Date | null;
  calendarId: string;
  status: IntegrationStatus;
  isEnabled: boolean;
  lastSyncedAt: string | Date | null;
  lastTestedAt: string | Date | null;
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type IntegrationSettingsState = {
  googleCalendar: DoctorIntegrationRecord | null;
  googleMeet: DoctorIntegrationRecord | null;
  busyEventsCount: number;
  canManage: boolean;
};

export type GoogleOAuthTokens = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in: number;
  scope?: string;
};

export type GoogleCalendarBusyEvent = {
  providerEventId: string;
  calendarId: string;
  title: string | null;
  startAt: Date;
  endAt: Date;
  isAllDay: boolean;
  status: "busy";
};

export type GoogleMeetLinkResult = {
  googleEventId: string;
  meetUrl: string;
  meetCode: string | null;
};
