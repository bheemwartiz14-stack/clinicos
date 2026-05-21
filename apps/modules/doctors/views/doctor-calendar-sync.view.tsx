// @ts-nocheck
import { CalendarCheck, CheckCircle2, Clock3, Cloud, Layers, ShieldCheck } from "lucide-react";
import { SettingsSidebar } from "@modules/settings/profile/components/settings-sidebar";
import { DoctorCalendarSyncCard } from "../components/doctor-calendar-sync-card";
import { DoctorTabs } from "../components/doctor-tabs";
import type { DoctorCalendarConnection, DoctorCalendarBusyEvent } from "../types/doctor.types";

export function DoctorCalendarSyncView({ connection, busyEvents }: { connection: DoctorCalendarConnection | null; busyEvents: DoctorCalendarBusyEvent[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <SettingsSidebar role="doctor" />
      <main className="min-w-0 space-y-6">
        <div>
          <p className="text-sm font-semibold text-primary">Doctor Self-Service</p>
          <h1 className="mt-1 text-3xl font-semibold text-foreground">Calendar Sync</h1>
          <p className="mt-2 text-sm text-muted-foreground">Connect your calendar to automatically sync availability.</p>
        </div>

        <DoctorTabs />
        <DoctorCalendarSyncCard connection={connection} busyEventsCount={busyEvents.length} />

        <section className="grid gap-4 md:grid-cols-2">
          <InfoSection
            title="What gets synced?"
            icon={CalendarCheck}
            items={[
              "Working hours and availability",
              "Blocked time for meetings and appointments",
              "Out of office events",
              "Automatic slot blocking when calendar is busy"
            ]}
          />
          <InfoSection
            title="Coming soon"
            icon={Cloud}
            items={[
              "Microsoft Outlook integration",
              "iCal/CALDAV support",
              "Two-way sync with automatic conflict resolution"
            ]}
          />
        </section>
      </main>
    </div>
  );
}

function InfoSection({ title, icon: Icon, items }: { title: string; icon: typeof CheckCircle2; items: string[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3 rounded-xl border border-border bg-background/70 p-3 text-sm text-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
