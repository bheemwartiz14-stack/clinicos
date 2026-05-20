import { BadgeCheck, Building2, MapPin } from "lucide-react";
import type { SettingsProfile } from "../types/settings.types";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ProfileHeader({ profile }: { profile: SettingsProfile }) {
  return (
    <section className="overflow-hidden rounded-xl border border-white/70 bg-white/75 shadow-xl shadow-teal-950/5 backdrop-blur">
      <div className="h-24 bg-[linear-gradient(135deg,rgba(13,148,136,0.9),rgba(15,23,42,0.92)),url('/icons/icon.svg')] bg-cover" />
      <div className="flex flex-col gap-5 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-xl border-4 border-white bg-slate-900 text-2xl font-bold text-white shadow-lg">
            {profile.avatar ? <img src={profile.avatar} alt="" className="h-full w-full object-cover" /> : initials(profile.name)}
          </div>
          <div className="pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-950">{profile.name}</h1>
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                {profile.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-1 text-sm capitalize text-slate-600">{profile.role} access</p>
          </div>
        </div>
        <div className="grid gap-2 text-sm text-slate-600 sm:text-right">
          <span className="inline-flex items-center gap-2 sm:justify-end">
            <Building2 className="h-4 w-4 text-teal-700" aria-hidden />
            {profile.branchName ?? "No branch"}
          </span>
          <span className="inline-flex items-center gap-2 sm:justify-end">
            <MapPin className="h-4 w-4 text-teal-700" aria-hidden />
            {profile.departmentName ?? "No department"}
          </span>
        </div>
      </div>
    </section>
  );
}
