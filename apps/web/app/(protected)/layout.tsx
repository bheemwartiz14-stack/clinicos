import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/lib/auth";
import { settingsService } from "@modules/settings/profile/services/settings.service";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  try {
    const session = await requireSession();
    const profile = await settingsService.getProfile(session.userId);
    return (
      <AppShell session={session} shellUser={{ avatar: profile.avatar, branchName: profile.branchName }}>
        {children}
      </AppShell>
    );
  } catch {
    redirect("/login");
  }
}
