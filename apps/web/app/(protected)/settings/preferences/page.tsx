import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { settingsService } from "@modules/settings/profile/services/settings.service";
import { PreferencesSettingsView } from "@modules/settings/profile/views/settings-dashboard-view";

export const metadata: Metadata = {
  title: "Appearance Settings | MediClinic Pro"
};

export default async function PreferencesSettingsPage() {
  const session = await requireSession();
  const { profile } = await settingsService.overview(session.userId, session.sessionId);
  return <PreferencesSettingsView profile={profile} />;
}
