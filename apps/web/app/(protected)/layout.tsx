import { AppShell } from "@/components/app-shell";
import { requirePageSession } from "@/lib/auth";
import { settingsService } from "@modules/settings/profile/services/settings.service";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requirePageSession();

  const profile = await settingsService.getProfile(session.userId).catch((error) => {
    console.error("Failed to load shell profile:", error);
    return null;
  });

  return (
    <AppShell session={session} shellUser={{ avatar: profile?.avatar, branchName: profile?.branchName }}>
      {children}
    </AppShell>
  );
}
