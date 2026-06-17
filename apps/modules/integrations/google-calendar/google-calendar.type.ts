import type { google } from "googleapis";

export type GoogleCalendarConnection = {
  id: string;
  userId: string;
  accessToken: string | null;
  refreshToken: string | null;
  expiryDate: Date | null;
  scope: string | null;
  calendarId: string | null;
  isConnected: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type GoogleAuthTokens = {
  access_token: string;
  refresh_token?: string | null;
  expiry_date?: number | null;
  scope?: string;
  token_type?: string;
};

export type CreateGoogleEventInput = {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  attendees?: { email: string }[];
  conferenceDataVersion?: number;
  conferenceData?: object;
};

export type UpdateGoogleEventInput = Partial<CreateGoogleEventInput> & {
  eventId: string;
};

export type SyncAppointmentInput = {
  patientName: string;
  doctorName: string;
  startTime: string;
  endTime: string;
  reason?: string | null;
  notes?: string | null;
  attendeeEmail?: string;
};

export type OAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export type CalendarEventResponse = {
  id: string;
  hangoutLink?: string | null;
  htmlLink?: string | null;
};

export type FreeBusyResult = {
  busy: { start: string; end: string }[];
};

export type VerifyResult = {
  valid: boolean;
  error?: string;
};

export type GoogleCalendarServiceInstance = {
  generateAuthUrl(userId: string): string;
  handleCallback(code: string, state: string): Promise<{ success: boolean }>;
  exchangeCodeAndSaveTokens(code: string, state: string): Promise<{ userId: string }>;
  createCalendarAndSaveId(userId: string): Promise<void>;
  verifyConnection(userId: string): Promise<VerifyResult>;
  createCalendarEvent(userId: string, input: CreateGoogleEventInput): Promise<CalendarEventResponse>;
  updateCalendarEvent(userId: string, input: UpdateGoogleEventInput): Promise<void>;
  deleteCalendarEvent(userId: string, eventId: string): Promise<void>;
  disconnect(userId: string): Promise<void>;
  checkAvailability(userId: string, timeMin: string, timeMax: string): Promise<FreeBusyResult>;
};
