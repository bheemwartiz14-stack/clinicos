import { Bell, LockKeyhole, ShieldCheck, SlidersHorizontal } from "lucide-react";

const settings = [
  ["Clinic profile", "Manage clinic identity, address, and contact details.", SlidersHorizontal],
  ["Security", "Password rules, session duration, and protected access.", LockKeyhole],
  ["Notifications", "Configure appointment, billing, and inventory alerts.", Bell],
  [
    "Roles and access",
    "Control permissions for doctors, billing, and reception teams.",
    ShieldCheck,
  ],
];

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure clinic workspace preferences and access controls.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {settings.map(([title, description, Icon]) => (
          <div key={title as string} className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="mb-4 grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <h2 className="font-semibold text-foreground">{title as string}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description as string}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
