import Link from "next/link";
import type React from "react";
import { CheckCircle2, Clock3, KeyRound, Laptop, Mail, ShieldCheck, UserRound } from "lucide-react";
import { updateProfileAction, changePasswordAction } from "../actions/settings.actions";
import type { ProfileSummary, SessionSummary } from "../services/settings.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/form-controls";
import { AvatarUploadField } from "@/components/avatar-upload-field";

type SettingsProps = {
  profile: ProfileSummary;
};

type ProfileProps = SettingsProps & {
  branches?: Array<{ id: string; name: string }>;
  departments?: Array<{ id: string; name: string }>;
};

type SecurityProps = SettingsProps & {
  sessions: SessionSummary[];
};

function roleLabel(role: string) {
  return role
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: Date | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function SettingsHeader({ profile, active }: SettingsProps & { active: string }) {
  const tabs = [
    ["Profile", "/settings/profile"],
    ["Security", "/settings/security"],
    ["Account", "/settings/account"]
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-lg bg-primary text-base font-bold text-primary-foreground">
            {profile.avatar ? <img src={profile.avatar} alt="" className="h-full w-full object-cover" /> : initials(profile.name)}
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-normal">{profile.name}</h1>
            <p className="text-sm text-muted-foreground">{roleLabel(profile.role)} · {profile.email}</p>
          </div>
        </div>
        <Badge variant="outline" className="w-fit capitalize">{profile.status}</Badge>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b">
        {tabs.map(([label, href]) => (
          <Button key={href} asChild variant={active === label ? "default" : "ghost"} size="sm" className="mb-2">
            <Link href={href}>{label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}

export function SettingsDashboardView({ profile }: SettingsProps) {
  return (
    <div className="space-y-5">
      <SettingsHeader profile={profile} active="Profile" />
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard icon={UserRound} title="Profile" value={profile.name} detail="Personal and contact details" href="/settings/profile" />
        <SummaryCard icon={ShieldCheck} title="Security" value={profile.emailVerified ? "Verified" : "Needs review"} detail="Password and sessions" href="/settings/security" />
        <SummaryCard icon={CheckCircle2} title="Account" value={roleLabel(profile.role)} detail="Role and account details" href="/settings/account" />
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, title, value, detail, href }: { icon: typeof UserRound; title: string; value: string; detail: string; href: string }) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{detail}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-sm font-medium">{value}</span>
        <Button asChild variant="outline" size="sm">
          <Link href={href}>Open</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function ProfileSettingsView({ profile }: ProfileProps) {
  return (
    <div className="space-y-5">
      <SettingsHeader profile={profile} active="Profile" />
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your name, username, phone number, and avatar image.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfileAction} className="grid gap-4 md:grid-cols-2">
            <FormField label="First name" name="firstName" defaultValue={profile.firstName} required />
            <FormField label="Last name" name="lastName" defaultValue={profile.lastName ?? ""} />
            <FormField label="Username" name="username" defaultValue={profile.username ?? ""} />
            <FormField label="Phone" name="phone" defaultValue={profile.phone ?? ""} />
            <AvatarUploadField name="avatar" defaultValue={profile.avatar} className="md:col-span-2" />
            <div className="md:col-span-2">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function SecuritySettingsView({ profile, sessions }: SecurityProps) {
  return (
    <div className="space-y-5">
      <SettingsHeader profile={profile} active="Security" />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Changing your password signs out all active sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={changePasswordAction} className="space-y-4">
              <FormField label="Current password" name="currentPassword" type="password" required />
              <FormField label="New password" name="newPassword" type="password" required />
              <FormField label="Confirm password" name="confirmPassword" type="password" required />
              <Button type="submit">
                <KeyRound className="h-4 w-4" aria-hidden />
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Session Management</CardTitle>
            <CardDescription>Recent browser sessions for this account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.length === 0 ? <p className="text-sm text-muted-foreground">No sessions found.</p> : null}
            {sessions.map((session) => (
              <div key={session.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                <div className="flex min-w-0 gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">
                    <Laptop className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{session.userAgent ?? "Unknown browser"}</p>
                    <p className="text-xs text-muted-foreground">{session.ipAddress ?? "No IP"} · Expires {formatDate(session.expiresAt)}</p>
                  </div>
                </div>
                <Badge variant={session.isActive ? "default" : "outline"}>{session.isCurrent ? "Current" : session.isActive ? "Active" : "Ended"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AccountSettingsView({ profile, sessions, loginHistory }: SecurityProps & { loginHistory: SessionSummary[] }) {
  return (
    <div className="space-y-5">
      <SettingsHeader profile={profile} active="Account" />
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard icon={Mail} title="Email" value={profile.email} detail={profile.emailVerified ? "Verified email address" : "Verification pending"} href="/settings/profile" />
        <SummaryCard icon={Clock3} title="Last Login" value={formatDate(profile.lastLoginAt)} detail={`${sessions.length} recent sessions`} href="/settings/security" />
        <SummaryCard icon={CheckCircle2} title="Role" value={roleLabel(profile.role)} detail="Role based access control" href="/settings/account" />
      </div>
      <LoginHistorySettingsView profile={profile} loginHistory={loginHistory} />
    </div>
  );
}

export function PreferencesSettingsView({ profile }: SettingsProps) {
  return (
    <div className="space-y-5">
      <SettingsHeader profile={profile} active="Account" />
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Use the header theme toggle to switch between light and dark modes.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export function LoginHistorySettingsView({ profile, loginHistory }: SettingsProps & { loginHistory: SessionSummary[] }) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Login History</CardTitle>
        <CardDescription>Recent sign-ins and active browser sessions for {profile.name}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loginHistory.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">{entry.ipAddress ?? "Unknown IP"}</p>
              <p className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>
            </div>
            <Badge variant={entry.isActive ? "default" : "outline"}>{entry.isActive ? "Success" : "Ended"}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
