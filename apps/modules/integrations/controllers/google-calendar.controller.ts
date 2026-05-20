import { NextResponse } from "next/server";
import { can } from "@mediclinic/rbac";
import { getSession } from "@/lib/auth";
import { resolveDoctorForIntegration } from "../services/integration.service";
import { googleCalendarService } from "../services/google-calendar.service";

export async function syncGoogleCalendarController(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(session.role, "integrations.google_calendar.manage") && !can(session.role, "doctors.calendar.sync")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const doctor = await resolveDoctorForIntegration({ sessionUserId: session.userId, role: session.role, doctorId: body.doctorId, manage: true });
  const result = await googleCalendarService.sync(doctor.id, { daysAhead: body.daysAhead ?? 30 });
  return NextResponse.json({ success: true, message: `Synced ${result.eventsCount} busy events.`, ...result });
}
