import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { settingsService } from "@modules/settings/profile/services/settings.service";
import { NotificationSettingsView } from "@modules/settings/profile/views/settings-dashboard-view";

export const metadata: Metadata = {
  title: "Notification Settings | MediClinic Pro"
};

export default async function NotificationSettingsPage() {
  const session = await requireSession();
  const { profile, preferences } = await settingsService.overview(session.userId, session.sessionId);
  return <NotificationSettingsView profile={profile} preferences={preferences} />;
}
