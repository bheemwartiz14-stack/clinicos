import type { Metadata } from "next";
import { Suspense } from "react";
import { requirePagePermission } from "@/lib/auth";
import { settingsService } from "@modules/settings/profile/services/settings.service";
import { SettingsDashboardView } from "@modules/settings/profile/views/settings-dashboard-view";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Settings | MediClinic Pro",
    description: "Profile, account, security, notification, and appearance settings."
  };
}

export default async function SettingsPage() {
  const session = await requirePagePermission("settings.profile");
  const { profile } = await settingsService.overview(session.userId, session.sessionId);

  return (
    <Suspense fallback={<div className="rounded-xl border bg-white/80 p-6 text-sm text-slate-600">Loading settings...</div>}>
      <SettingsDashboardView profile={profile} />
    </Suspense>
  );
}
