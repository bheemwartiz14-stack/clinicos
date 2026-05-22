import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { settingsService } from "@modules/settings/profile/services/settings.service";
import { LoginHistorySettingsView } from "@modules/settings/profile/views/settings-dashboard-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login History | MediClinic Pro"
};

export default async function LoginHistoryPage() {
  const session = await requirePagePermission("settings.profile");
  const { profile, loginHistory } = await settingsService.overview(session.userId, session.sessionId);
  return <LoginHistorySettingsView profile={profile} loginHistory={loginHistory} />;
}
