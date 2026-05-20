"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { resolveDoctorForIntegration } from "../services/integration.service";
import { googleCalendarService } from "../services/google-calendar.service";
import { syncGoogleCalendarSchema } from "../schemas/google-calendar.schema";

export async function syncGoogleCalendarAction(formData: FormData) {
  const session = await requirePermission("integrations.google_calendar.manage");
  const parsed = syncGoogleCalendarSchema.parse({
    doctorId: formData.get("doctorId") || undefined,
    daysAhead: formData.get("daysAhead") || 30
  });
  const doctor = await resolveDoctorForIntegration({ sessionUserId: session.userId, role: session.role, doctorId: parsed.doctorId, manage: true });
  await googleCalendarService.sync(doctor.id, parsed);
  revalidatePath("/settings/integration");
}
