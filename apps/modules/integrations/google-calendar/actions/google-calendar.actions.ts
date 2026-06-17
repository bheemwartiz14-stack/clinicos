"use server";

import { GoogleCalendarRepository } from "../google-calendar.repository";
import { googleCalendarService } from "../google-calendar.service";

export async function getGoogleCalendarStatusAction(userId: string) {
  const connection = await GoogleCalendarRepository.getByUserId(userId);
  const isConnected = connection?.isConnected ?? false;

  let verified = isConnected;
  let verificationError: string | undefined;

  if (isConnected) {
    const result = await googleCalendarService.verifyConnection(userId);
    verified = result.valid;
    verificationError = result.error;
  }

  return {
    isConnected: verified,
    email: connection?.scope ?? null,
    calendarId: connection?.calendarId ?? null,
    verificationError,
  };
}

export async function disconnectGoogleCalendarAction(userId: string) {
  await googleCalendarService.disconnect(userId);
}

export async function connectGoogleCalendarAction(userId: string) {
  return googleCalendarService.generateAuthUrl(userId);
}

export async function handleGoogleCallbackAction(code: string, state: string) {
  await googleCalendarService.handleCallback(code, state);
  return { success: true };
}

export async function exchangeGoogleCodeAction(code: string, state: string) {
  const { userId } = await googleCalendarService.exchangeCodeAndSaveTokens(code, state);
  return { userId };
}

export async function createGoogleCalendarAction(userId: string) {
  await googleCalendarService.createCalendarAndSaveId(userId);
  return { success: true };
}
