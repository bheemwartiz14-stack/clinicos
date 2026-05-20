"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { integrationService, resolveDoctorForIntegration } from "../services/integration.service";
import { disconnectIntegrationSchema } from "../schemas/integration.schema";

export async function disconnectIntegrationAction(formData: FormData) {
  const session = await requirePermission("integrations.manage");
  const parsed = disconnectIntegrationSchema.parse({
    doctorId: formData.get("doctorId") || undefined,
    provider: formData.get("provider")
  });
  const doctor = await resolveDoctorForIntegration({ sessionUserId: session.userId, role: session.role, doctorId: parsed.doctorId, manage: true });
  await integrationService.disconnect(doctor.id, parsed.provider);
  revalidatePath("/settings/integration");
}
