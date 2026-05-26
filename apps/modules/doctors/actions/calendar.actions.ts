"use server";

import { requirePagePermission as requirePermission } from "@/lib/auth";
import { googleCalendarService } from "../services/google-calendar.service";

export async function getGoogleAuthUrlAction(doctorId: string) {
  await requirePermission("doctors.edit");
  return googleCalendarService.getAuthUrl(doctorId);
}

export async function handleGoogleCallbackAction(code: string) {
  return googleCalendarService.handleCallback(code);
}

export async function createCalendarEventAction(params: {
  accessToken: string;
  refreshToken?: string;
  summary: string;
  description?: string;
  startTime: string;
  endTime: string;
  addMeetLink?: boolean;
  attendees?: { email: string }[];
}) {
  await requirePermission("appointments.create");
  return googleCalendarService.createEvent(params);
}

export async function updateCalendarEventAction(params: {
  accessToken: string;
  refreshToken?: string;
  eventId: string;
  summary?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}) {
  await requirePermission("appointments.edit");
  return googleCalendarService.updateEvent(params);
}

export async function deleteCalendarEventAction(params: {
  accessToken: string;
  refreshToken?: string;
  eventId: string;
}) {
  await requirePermission("appointments.cancel");
  return googleCalendarService.deleteEvent(params);
}

export async function checkCalendarAvailabilityAction(params: {
  accessToken: string;
  refreshToken?: string;
  timeMin: string;
  timeMax: string;
}) {
  await requirePermission("appointments.view");
  return googleCalendarService.checkAvailability(params);
}
