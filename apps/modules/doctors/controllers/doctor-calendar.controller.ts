// @ts-nocheck
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { can } from "@mediclinic/rbac";
import { getSession } from "@/lib/auth";
import { doctorService } from "../services/doctor.service";
import { doctorCalendarService } from "../services/doctor-calendar.service";
import {
  buildStatePayload,
  exchangeCodeForTokens,
  getBusySlotsFromEvents,
  getCalendarEvents,
  getGoogleAuthUrl,
  getGoogleUserInfo,
  parseStatePayload,
  refreshAccessToken
} from "../services/google-calendar.service";
import { decryptCalendarToken, encryptCalendarToken } from "../utils/calendar-token-encryption";

async function currentDoctor() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "doctor" && !can(session.role, "doctors.calendar.manage")) {
    throw new Error("Forbidden");
  }
  const doctor = await doctorService.getByUserId(session.userId);
  if (!doctor) throw new Error("Doctor profile not found.");
  return { session, doctor };
}

function settingsUrl(status: "success" | "error", code: string) {
  return `/settings/my-calendar-sync?${status}=${encodeURIComponent(code)}`;
}

async function syncDoctorCalendar(doctorId: string, syncType: "manual" | "automatic" | "callback" = "manual") {
  const connection = await doctorCalendarService.getConnection(doctorId);
  if (!connection || !connection.isConnected || !connection.accessToken) {
    throw new Error("Google Calendar is not connected.");
  }

  let accessToken = decryptCalendarToken(connection.accessToken);
  const refreshToken = decryptCalendarToken(connection.refreshToken);

  if (await doctorCalendarService.isTokenExpired(connection)) {
    if (!refreshToken) throw new Error("Google Calendar refresh token is missing.");
    const refreshed = await refreshAccessToken(refreshToken);
    accessToken = refreshed.access_token;
    await doctorCalendarService.updateTokens(connection.id, {
      accessToken: encryptCalendarToken(refreshed.access_token) ?? refreshed.access_token,
      refreshToken: refreshed.refresh_token ? encryptCalendarToken(refreshed.refresh_token) ?? refreshed.refresh_token : undefined,
      expiryDate: new Date(Date.now() + refreshed.expires_in * 1000)
    });
  }

  if (!accessToken) throw new Error("Google Calendar access token is missing.");

  const log = await doctorCalendarService.recordSyncStart(doctorId, connection.id, syncType);
  try {
    const timeMin = new Date();
    const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const events = await getCalendarEvents(accessToken, connection.calendarId ?? "primary", timeMin, timeMax);
    const busyEvents = getBusySlotsFromEvents(events);
    await doctorCalendarService.syncBusyEvents(doctorId, busyEvents);
    await doctorCalendarService.recordSyncComplete(log.id, "success", `Synced ${busyEvents.length} busy event(s).`);
    return { busyEventsCount: busyEvents.length };
  } catch (error) {
    await doctorCalendarService.recordSyncComplete(log.id, "failed", error instanceof Error ? error.message : "Calendar sync failed.");
    throw error;
  }
}

export async function doctorCalendarConnectController() {
  try {
    const { session, doctor } = await currentDoctor();
    if (!can(session.role, "doctors.calendar.connect") && !can(session.role, "doctors.calendar.manage")) {
      return new Response("Forbidden", { status: 403 });
    }
    redirect(getGoogleAuthUrl(buildStatePayload({ doctorId: doctor.id, userId: session.userId })) as any);
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") return new Response("Forbidden", { status: 403 });
    redirect(settingsUrl("error", error instanceof Error ? error.message : "connect_failed") as any);
  }
}

export async function doctorCalendarCallbackController(request: Request) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  if (error) redirect(settingsUrl("error", error) as any);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !state) redirect(settingsUrl("error", "missing_code") as any);

  try {
    const parsed = parseStatePayload(state);
    if (!parsed || parsed.userId !== session.userId) throw new Error("Invalid OAuth state.");
    const doctor = await doctorService.getByUserId(session.userId);
    if (!doctor || doctor.id !== parsed.doctorId) throw new Error("Doctor profile mismatch.");
    const tokens = await exchangeCodeForTokens(code);
    const userInfo = await getGoogleUserInfo(tokens.access_token);
    await doctorCalendarService.createConnection({
      doctorId: doctor.id,
      userId: session.userId,
      provider: "google",
      providerAccountEmail: userInfo.email,
      accessToken: encryptCalendarToken(tokens.access_token) ?? tokens.access_token,
      refreshToken: encryptCalendarToken(tokens.refresh_token) ?? undefined,
      tokenType: tokens.token_type,
      scope: tokens.scope,
      expiryDate: new Date(Date.now() + tokens.expires_in * 1000),
      calendarId: "primary"
    });
    await syncDoctorCalendar(doctor.id, "callback");
    redirect(settingsUrl("success", "connected") as any);
  } catch (caught) {
    console.error("Doctor calendar callback failed:", caught);
    redirect(settingsUrl("error", "callback_failed") as any);
  }
}

export async function doctorCalendarDisconnectController() {
  try {
    const { session, doctor } = await currentDoctor();
    if (!can(session.role, "doctors.calendar.disconnect") && !can(session.role, "doctors.calendar.manage")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await doctorCalendarService.disconnect(doctor.id);
    return NextResponse.json({ success: true, message: "Google Calendar disconnected." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Disconnect failed." }, { status: 400 });
  }
}

export async function doctorCalendarSyncController() {
  try {
    const { session, doctor } = await currentDoctor();
    if (!can(session.role, "doctors.calendar.sync") && !can(session.role, "doctors.calendar.manage")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const result = await syncDoctorCalendar(doctor.id, "manual");
    return NextResponse.json({ success: true, message: `Synced ${result.busyEventsCount} busy event(s).`, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Calendar sync failed." }, { status: 400 });
  }
}

export async function doctorCalendarModelForCurrentUser() {
  const { doctor } = await currentDoctor();
  const [connection, busyEvents, schedules, breaks, leaves, visitSettings, slots] = await Promise.all([
    doctorCalendarService.getConnection(doctor.id),
    doctorCalendarService.getBusyEvents(doctor.id, new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    doctorService.getSchedules(doctor.id),
    doctorService.getBreaks(doctor.id),
    doctorService.getLeaveBlocks(doctor.id),
    doctorService.getVisitSettings(doctor.id),
    doctorService.getSlots(doctor.id, new Date())
  ]);
  return { doctor, connection, busyEvents, schedules, breaks, leaves, visitSettings, slots };
}
