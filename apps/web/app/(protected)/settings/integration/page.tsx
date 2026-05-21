import { redirect } from "next/navigation";
import { requirePageSession } from "@/lib/auth";
import { doctorService } from "@modules/doctors/services/doctor.service";
import { integrationService } from "@modules/integrations/services/integration.service";
import { googleCalendarService } from "@modules/integrations/services/google-calendar.service";
import { IntegrationSettingsView } from "@modules/integrations/views/integration-settings.view";
import type { DoctorIntegrationRecord } from "@modules/integrations/types/integration.types";

export const metadata = { title: "Integrations | MediClinic Pro" };

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function IntegrationSettingsPage({ searchParams }: PageProps) {
  const session = await requirePageSession();
  if (session.role !== "doctor") {
    redirect("/settings");
  }

  const params = searchParams ? await searchParams : {};
  const doctor = await doctorService.getByUserId(session.userId);
  if (!doctor) redirect("/");

  const [googleCalendar, googleMeet] = await Promise.all([
    integrationService.get(doctor.id, "google_calendar"),
    integrationService.get(doctor.id, "google_meet")
  ]);
  const busyEvents = await googleCalendarService.busyEvents(
    doctor.id,
    new Date(),
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  const statusMessage = getStatusMessage(
    typeof params.success === "string" ? params.success : null,
    typeof params.error === "string" ? params.error : null
  );

  return (
    <IntegrationSettingsView
      role={session.role}
      initialTab={typeof params.tab === "string" ? params.tab : null}
      statusMessage={statusMessage}
      state={{
        googleCalendar: serializeIntegration(googleCalendar),
        googleMeet: serializeIntegration(googleMeet),
        busyEventsCount: busyEvents.length,
        canManage: true
      }}
    />
  );
}

function serializeIntegration(integration: any): DoctorIntegrationRecord | null {
  if (!integration) return null;
  return {
    ...integration,
    expiryDate: integration.expiryDate ? new Date(integration.expiryDate).toISOString() : null,
    lastSyncedAt: integration.lastSyncedAt ? new Date(integration.lastSyncedAt).toISOString() : null,
    lastTestedAt: integration.lastTestedAt ? new Date(integration.lastTestedAt).toISOString() : null,
    createdAt: new Date(integration.createdAt).toISOString(),
    updatedAt: new Date(integration.updatedAt).toISOString(),
    metadata: integration.metadata ?? {}
  };
}

function getStatusMessage(success: string | null, error: string | null) {
  if (success === "connected") return "Integration connected successfully.";
  if (!error) return null;
  const errors: Record<string, string> = {
    access_denied: "Google access was denied.",
    missing_code: "Google did not return an authorization code.",
    callback_failed: "Could not complete Google integration. Check the redirect URI and OAuth client settings.",
    oauth_not_configured: "Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
    doctor_profile_missing: "A doctor profile is required before connecting Google Calendar or Meet."
  };
  return errors[error] ?? "Integration action failed.";
}
