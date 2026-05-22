import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { settingsService } from "@modules/settings/profile/services/settings.service";
import { NotificationSettingsView } from "@modules/settings/profile/views/settings-dashboard-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notification Settings | MediClinic Pro"
};

export default async function NotificationSettingsPage() {
  const session = await requirePagePermission("settings.profile");
  const { profile, preferences } = await settingsService.overview(session.userId, session.sessionId);
  return <NotificationSettingsView profile={profile} preferences={preferences} />;
}
