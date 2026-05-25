import { AppShell } from "@/components/app-shell";
import { requirePageSession } from "@/lib/auth";
import { createScopedLogger } from "@mediclinic/logger";
import { settingsService } from "@modules/settings/profile/services/settings.service";

export const dynamic = "force-dynamic";

const logger = createScopedLogger("protected-layout");

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requirePageSession();

  const profile = await settingsService.getProfile(session.userId).catch((error) => {
    logger.error("Failed to load shell profile", { error, userId: session.userId });
    return null;
  });

  return (
    <AppShell session={session} shellUser={{ avatar: profile?.avatar, branchName: profile?.branchName }}>
      {children}
    </AppShell>
  );
}
