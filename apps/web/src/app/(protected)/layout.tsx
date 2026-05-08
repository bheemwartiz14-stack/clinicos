import { redirect } from "next/navigation";

import { ProtectedWorkspace } from "@/components/dashboard/protected-workspace";
import { getCurrentUser } from "@/modules/auth/auth.service";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <ProtectedWorkspace>{children}</ProtectedWorkspace>;
}
