import { Clock, KeyRound, ShieldCheck } from "lucide-react";
import type { SettingsProfile } from "../types/settings.types";

function formatDate(value: Date | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export function SecurityCard({ profile }: { profile: SettingsProfile }) {
  const cardClass = "rounded-xl border border-border bg-card/80 p-5 shadow-lg shadow-foreground/5 backdrop-blur";

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <div className={cardClass}>
        <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
        <p className="mt-3 text-sm font-semibold text-foreground">Role security</p>
        <p className="mt-1 text-sm capitalize text-muted-foreground">{profile.role} permissions</p>
      </div>
      <div className={cardClass}>
        <KeyRound className="h-5 w-5 text-primary" aria-hidden />
        <p className="mt-3 text-sm font-semibold text-foreground">Password changed</p>
        <p className="mt-1 text-sm text-muted-foreground">{formatDate(profile.lastPasswordChangedAt)}</p>
      </div>
      <div className={cardClass}>
        <Clock className="h-5 w-5 text-primary" aria-hidden />
        <p className="mt-3 text-sm font-semibold text-foreground">Last login</p>
        <p className="mt-1 text-sm text-muted-foreground">{formatDate(profile.lastLoginAt)}</p>
      </div>
    </section>
  );
}
