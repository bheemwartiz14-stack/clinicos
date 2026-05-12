import { redirect } from "next/navigation";

import { ProtectedWorkspace } from "@/components/dashboard/protected-workspace";
import { getCurrentUser } from "@/modules/auth/auth.service";
import { getGeneralSettingsMetadataData } from "@/modules/setting/genral-setting/genral-setting.service";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([getCurrentUser(), getGeneralSettingsMetadataData()]);

  if (!user) {
    redirect("/login");
  }

  return (
    <ProtectedWorkspace settings={settings} user={user}>
      {children}
    </ProtectedWorkspace>
  );
}
