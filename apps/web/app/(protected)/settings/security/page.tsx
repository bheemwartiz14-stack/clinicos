import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { settingsService } from "@modules/settings/profile/services/settings.service";
import { SecuritySettingsView } from "@modules/settings/profile/views/settings-dashboard-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Security Settings | MediClinic Pro"
};

export default async function SecuritySettingsPage() {
  const session = await requirePagePermission("settings.profile");
  const { profile, sessions } = await settingsService.overview(session.userId, session.sessionId);
  return <SecuritySettingsView profile={profile} sessions={sessions} />;
}
