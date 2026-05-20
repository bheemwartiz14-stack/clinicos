import { Clock, KeyRound, ShieldCheck } from "lucide-react";
import type { SettingsProfile } from "../types/settings.types";

function formatDate(value: Date | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export function SecurityCard({ profile }: { profile: SettingsProfile }) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-teal-950/5 backdrop-blur">
        <ShieldCheck className="h-5 w-5 text-teal-700" aria-hidden />
        <p className="mt-3 text-sm font-semibold text-slate-900">Role security</p>
        <p className="mt-1 text-sm capitalize text-slate-500">{profile.role} permissions</p>
      </div>
      <div className="rounded-xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-teal-950/5 backdrop-blur">
        <KeyRound className="h-5 w-5 text-teal-700" aria-hidden />
        <p className="mt-3 text-sm font-semibold text-slate-900">Password changed</p>
        <p className="mt-1 text-sm text-slate-500">{formatDate(profile.lastPasswordChangedAt)}</p>
      </div>
      <div className="rounded-xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-teal-950/5 backdrop-blur">
        <Clock className="h-5 w-5 text-teal-700" aria-hidden />
        <p className="mt-3 text-sm font-semibold text-slate-900">Last login</p>
        <p className="mt-1 text-sm text-slate-500">{formatDate(profile.lastLoginAt)}</p>
      </div>
    </section>
  );
}
