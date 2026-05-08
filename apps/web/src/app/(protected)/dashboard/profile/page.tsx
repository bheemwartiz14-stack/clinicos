import { Mail, ShieldCheck, UserRound } from "lucide-react";

import { getCurrentUser } from "@/modules/auth/auth.service";

export default async function DashboardProfilePage() {
  const user = await getCurrentUser();

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">Account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your authenticated MediClinic workspace profile.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">Name</p>
            <p className="mt-2 font-medium text-foreground">{user?.name}</p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">Email</p>
            <p className="mt-2 break-words font-medium text-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      <aside className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="grid size-12 place-items-center rounded-lg bg-primary/10 text-primary">
          <UserRound className="size-6" />
        </div>

        <h2 className="mt-4 font-semibold text-foreground">{user?.name}</h2>

        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="size-4" />
          <span className="min-w-0 truncate">{user?.email}</span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4" />
          <span className="capitalize">{user?.role}</span>
        </div>
      </aside>
    </section>
  );
}
