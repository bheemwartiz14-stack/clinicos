import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { settingsService } from "@modules/settings/profile/services/settings.service";
import { LoginHistorySettingsView } from "@modules/settings/profile/views/settings-dashboard-view";

export const metadata: Metadata = {
  title: "Login History | MediClinic Pro"
};

export default async function LoginHistoryPage() {
  const session = await requireSession();
  const { profile, loginHistory } = await settingsService.overview(session.userId, session.sessionId);
  return <LoginHistorySettingsView profile={profile} loginHistory={loginHistory} />;
}
