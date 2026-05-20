import Link from "next/link";
import { Bell, KeyRound, Palette, Settings, UserRound } from "lucide-react";
import type { SettingsOption, SettingsProfile, SessionRecord, LoginHistoryRecord } from "../types/settings.types";
import { ProfileHeader } from "../components/profile-header";
import { SettingsSidebar } from "../components/settings-sidebar";
import { ProfileForm } from "../components/profile-form";
import { PasswordForm } from "../components/password-form";
import { NotificationPreferencesForm } from "../components/notification-preferences-form";
import { AccountForm } from "../components/account-form";
import { SessionTable } from "../components/session-table";
import { LoginHistoryTable } from "../components/login-history-table";
import { SecurityCard } from "../components/security-card";

type Preferences = React.ComponentProps<typeof NotificationPreferencesForm>["preferences"];

const cards = [
  { label: "Profile Settings", href: "/settings/profile", icon: UserRound, text: "Identity, contact details, avatar, assignment, and role context." },
  { label: "Security Settings", href: "/settings/security", icon: KeyRound, text: "Password changes, device sessions, and account protection." },
  { label: "Notification Settings", href: "/settings/notifications", icon: Bell, text: "Email, SMS, WhatsApp, billing, appointment, and system alerts." },
  { label: "Appearance Settings", href: "/settings/preferences", icon: Palette, text: "Workspace preferences and display controls for dashboard comfort." },
  { label: "Account Settings", href: "/settings/account", icon: Settings, text: "Username, email, visibility, status, sessions, and login history." }
];

function SettingsFrame({ profile, children }: { profile: SettingsProfile; children: React.ReactNode }) {
  return (
    <div className="grid gap-6">
      <ProfileHeader profile={profile} />
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <SettingsSidebar role={profile.role} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

export function SettingsDashboardView({ profile }: { profile: SettingsProfile }) {
  return (
    <SettingsFrame profile={profile}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href as any} className="group rounded-xl border border-white/70 bg-white/70 p-5 shadow-lg shadow-teal-950/5 backdrop-blur transition hover:-translate-y-0.5 hover:border-teal-200 hover:bg-white">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-teal-50 text-teal-700 transition group-hover:bg-teal-700 group-hover:text-white">
              <card.icon className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-slate-950">{card.label}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{card.text}</p>
          </Link>
        ))}
      </div>
    </SettingsFrame>
  );
}

export function ProfileSettingsView({ profile, branches, departments }: { profile: SettingsProfile; branches: SettingsOption[]; departments: SettingsOption[] }) {
  return (
    <SettingsFrame profile={profile}>
      <ProfileForm profile={profile} branches={branches} departments={departments} />
    </SettingsFrame>
  );
}

export function SecuritySettingsView({ profile, sessions }: { profile: SettingsProfile; sessions: SessionRecord[] }) {
  return (
    <SettingsFrame profile={profile}>
      <div className="grid gap-5">
        <SecurityCard profile={profile} />
        <PasswordForm />
        <SessionTable sessions={sessions} />
      </div>
    </SettingsFrame>
  );
}

export function NotificationSettingsView({ profile, preferences }: { profile: SettingsProfile; preferences: Preferences }) {
  return (
    <SettingsFrame profile={profile}>
      <NotificationPreferencesForm preferences={preferences} />
    </SettingsFrame>
  );
}

export function AccountSettingsView({ profile, sessions, loginHistory }: { profile: SettingsProfile; sessions: SessionRecord[]; loginHistory: LoginHistoryRecord[] }) {
  return (
    <SettingsFrame profile={profile}>
      <div className="grid gap-5">
        <AccountForm profile={profile} />
        <SessionTable sessions={sessions} />
        <LoginHistoryTable records={loginHistory} />
      </div>
    </SettingsFrame>
  );
}

export function PreferencesSettingsView({ profile }: { profile: SettingsProfile }) {
  return (
    <SettingsFrame profile={profile}>
      <section className="rounded-xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-teal-950/5 backdrop-blur">
        <h2 className="text-lg font-semibold text-slate-950">Appearance Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Dashboard appearance controls are ready for theme, density, and accessibility preferences.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {["Comfortable density", "High contrast ready", "Healthcare workspace"].map((item) => (
            <div key={item} className="rounded-lg border border-slate-200 bg-white/80 p-4 text-sm font-semibold text-slate-700">{item}</div>
          ))}
        </div>
      </section>
    </SettingsFrame>
  );
}

export function LoginHistorySettingsView({ profile, loginHistory }: { profile: SettingsProfile; loginHistory: LoginHistoryRecord[] }) {
  return (
    <SettingsFrame profile={profile}>
      <LoginHistoryTable records={loginHistory} />
    </SettingsFrame>
  );
}
