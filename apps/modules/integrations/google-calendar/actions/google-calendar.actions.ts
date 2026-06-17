"use server";

import { GoogleCalendarRepository } from "../google-calendar.repository";
import { googleCalendarService } from "../google-calendar.service";

function logError(name: string, error: unknown) {
  console.error(`❌ ${name} FAILED:`, error);
}

export async function getGoogleCalendarStatusAction(userId: string) {
  try {
    if (!userId) throw new Error("userId is required");
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
  } catch (error) {
    logError("getGoogleCalendarStatusAction", error);
    throw error;
  }
}

export async function disconnectGoogleCalendarAction(userId: string) {
  try {
    if (!userId) throw new Error("userId is required");

    await googleCalendarService.disconnect(userId);

    return { success: true };
  } catch (error) {
    logError("disconnectGoogleCalendarAction", error);
    throw error;
  }
}

export async function connectGoogleCalendarAction(userId: string) {
  try {
    if (!userId) throw new Error("userId is required");
    const url = await googleCalendarService.generateAuthUrl(userId);
    return url;
  } catch (error) {
    logError("connectGoogleCalendarAction", error);
    throw error;
  }
}

export async function handleGoogleCallbackAction(code: string, state: string) {
  try {
    if (!code || !state) {
      throw new Error("Missing OAuth code or state");
    }

    await googleCalendarService.handleCallback(code, state);

    return { success: true };
  } catch (error) {
    logError("handleGoogleCallbackAction", error);
    throw error;
  }
}

export async function exchangeGoogleCodeAction(code: string, state: string) {
  try {
    if (!code || !state) {
      throw new Error("Missing code or state");
    }

    const { userId } =
      await googleCalendarService.exchangeCodeAndSaveTokens(code, state);

    return { userId };
  } catch (error) {
    logError("exchangeGoogleCodeAction", error);
    throw error;
  }
}

export async function createGoogleCalendarAction(userId: string) {
  try {
    if (!userId) throw new Error("userId is required");

    await googleCalendarService.createCalendarAndSaveId(userId);

    return { success: true };
  } catch (error) {
    logError("createGoogleCalendarAction", error);
    throw error;
  }
}