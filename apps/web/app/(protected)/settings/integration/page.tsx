import { redirect } from "next/navigation";
import { can } from "@mediclinic/rbac";
import { getSession } from "@/lib/auth";
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
  const session = await getSession();
  if (!session) redirect("/login");
  if (!can(session.role, "integrations.view")) redirect("/");

  const params = searchParams ? await searchParams : {};
  const doctorIdParam = typeof params.doctorId === "string" ? params.doctorId : null;
  const doctor = await resolveVisibleDoctor(session.userId, session.role, session.branchId, doctorIdParam);
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
        canManage: can(session.role, "integrations.manage") || session.role === "doctor"
      }}
    />
  );
}

async function resolveVisibleDoctor(userId: string, role: string, branchId: string, doctorId: string | null) {
  if (role === "doctor") return doctorService.getByUserId(userId);
  if (doctorId) return doctorService.getById(doctorId);
  const doctors = await doctorService.list({ branchId, isActive: true });
  return doctors[0] ?? null;
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
    callback_failed: "Could not complete Google integration. Please try again."
  };
  return errors[error] ?? "Integration action failed.";
}
