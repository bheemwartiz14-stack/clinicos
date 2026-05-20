import Link from "next/link";
import { Bell, Calendar, CalendarClock, Clock, History, Link2, LockKeyhole, Palette, Settings, Shield, Timer, UserRound } from "lucide-react";
import type { Role } from "@mediclinic/rbac";

interface NavItem {
  label: string;
  href: string;
  icon: typeof UserRound;
}

const items: NavItem[] = [
  { label: "Profile", href: "/settings/profile", icon: UserRound },
  { label: "Security", href: "/settings/security", icon: LockKeyhole },
  { label: "Preferences", href: "/settings/preferences", icon: Palette },
  { label: "Notifications", href: "/settings/notifications", icon: Bell },
  { label: "Integrations", href: "/settings/integration", icon: Link2 },
  { label: "Account", href: "/settings/account", icon: Settings },
  { label: "Login History", href: "/settings/login-history", icon: History }
];

const doctorItems: NavItem[] = [
{ label: "My Schedule", href: "/settings/my-schedule", icon: Clock },
{ label: "My Availability", href: "/settings/my-availability", icon: CalendarClock },
{ label: "My Leaves", href: "/settings/my-leaves", icon: Calendar },
{ label: "My Consultation", href: "/settings/my-consultation-settings", icon: Timer },
{ label: "Integrations", href: "/settings/integration", icon: Link2 },
];
export function SettingsSidebar({ role: _role }: { role: Role }) {
  return (
    <aside className="rounded-xl border border-white/70 bg-white/75 p-2 shadow-lg shadow-teal-952/5 backdrop-blur lg:sticky lg:top-24">
      <div className="mb-2 flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-900">
        <Shield className="h-4 w-4 text-teal-700" aria-hidden />
        Settings
      </div>
      <nav className="grid gap-1" aria-label="Settings">
        {items.map((item, idx) => (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <Link
            key={`${item.href}-${idx}`}
            href={item.href as any}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-teal-50 hover:text-teal-800"
          >
            <item.icon className="h-4 w-4" aria-hidden />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
