import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { settingsService } from "@modules/settings/profile/services/settings.service";
import { ProfileSettingsView } from "@modules/settings/profile/views/settings-dashboard-view";

export const metadata: Metadata = {
  title: "Profile Settings | MediClinic Pro"
};

export default async function ProfileSettingsPage() {
  const session = await requireSession();
  const { profile, branches, departments } = await settingsService.overview(session.userId, session.sessionId);
  return <ProfileSettingsView profile={profile} branches={branches} departments={departments} />;
}
