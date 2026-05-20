"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { resolveDoctorForIntegration } from "../services/integration.service";
import { googleMeetService } from "../services/google-meet.service";
import { saveGoogleMeetSettingsSchema } from "../schemas/google-meet.schema";

export async function saveGoogleMeetSettingsAction(formData: FormData) {
  const session = await requirePermission("integrations.google_meet.manage");
  const parsed = saveGoogleMeetSettingsSchema.parse({
    doctorId: formData.get("doctorId") || undefined,
    autoCreateMeetLink: formData.get("autoCreateMeetLink") === "on",
    defaultOnlineConsultation: formData.get("defaultOnlineConsultation") === "on"
  });
  const doctor = await resolveDoctorForIntegration({ sessionUserId: session.userId, role: session.role, doctorId: parsed.doctorId, manage: true });
  await googleMeetService.saveSettings(doctor.id, parsed);
  revalidatePath("/settings/integration");
}
