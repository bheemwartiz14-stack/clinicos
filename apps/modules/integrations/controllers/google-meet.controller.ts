import { NextResponse } from "next/server";
import { can } from "@mediclinic/rbac";
import { getSession } from "@/lib/auth";
import { resolveDoctorForIntegration } from "../services/integration.service";
import { googleMeetService } from "../services/google-meet.service";

export async function testGoogleMeetController(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(session.role, "integrations.google_meet.manage") && !can(session.role, "doctors.meet.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const doctor = await resolveDoctorForIntegration({ sessionUserId: session.userId, role: session.role, doctorId: body.doctorId, manage: true });
  await googleMeetService.test(doctor.id);
  return NextResponse.json({ success: true, message: "Google Meet integration is ready." });
}

export async function createGoogleMeetLinkController(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(session.role, "integrations.google_meet.manage") && !can(session.role, "doctors.meet.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  await resolveDoctorForIntegration({ sessionUserId: session.userId, role: session.role, doctorId: body.doctorId, manage: true });
  const result = await googleMeetService.createLink(body);
  return NextResponse.json({ success: true, message: "Google Meet link created.", ...result });
}

export async function saveGoogleMeetSettingsController(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(session.role, "integrations.google_meet.manage") && !can(session.role, "doctors.meet.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const doctor = await resolveDoctorForIntegration({ sessionUserId: session.userId, role: session.role, doctorId: body.doctorId, manage: true });
  await googleMeetService.saveSettings(doctor.id, body);
  return NextResponse.json({ success: true, message: "Google Meet settings saved." });
}
