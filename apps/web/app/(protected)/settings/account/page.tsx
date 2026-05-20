import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { settingsService } from "@modules/settings/profile/services/settings.service";
import { AccountSettingsView } from "@modules/settings/profile/views/settings-dashboard-view";

export const metadata: Metadata = {
  title: "Account Settings | MediClinic Pro"
};

export default async function AccountSettingsPage() {
  const session = await requireSession();
  const { profile, sessions, loginHistory } = await settingsService.overview(session.userId, session.sessionId);
  return <AccountSettingsView profile={profile} sessions={sessions} loginHistory={loginHistory} />;
}
