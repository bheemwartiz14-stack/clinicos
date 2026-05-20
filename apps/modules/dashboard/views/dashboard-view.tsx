"use client";

import { CalendarClock, CircleDollarSign, ClipboardCheck, Sparkles, UsersRound } from "lucide-react";
import { cn } from "@mediclinic/ui";

const metrics = [
  { label: "Today's Visits", value: "42", change: "+12%", icon: CalendarClock },
  { label: "Checked In", value: "18", change: "6 waiting", icon: ClipboardCheck },
  { label: "Active Patients", value: "8,420", change: "+248 this month", icon: UsersRound },
  { label: "Collections", value: "$24.8k", change: "92% captured", icon: CircleDollarSign }
];

const appointments = [
  { id: "apt-1", time: "09:00", patient: "Amelia Carter", doctor: "Dr. Hayes", type: "Follow-up", status: "Checked in", tone: "success" as const },
  { id: "apt-2", time: "09:20", patient: "Mason Lee", doctor: "Dr. Patel", type: "New patient", status: "Intake", tone: "info" as const },
  { id: "apt-3", time: "09:40", patient: "Olivia Brooks", doctor: "Dr. Nguyen", type: "Labs review", status: "Scheduled", tone: "neutral" as const },
  { id: "apt-4", time: "10:00", patient: "Noah Miller", doctor: "Dr. Hayes", type: "Urgent", status: "In room", tone: "warning" as const }
];

const statusToneClassLight: Record<string, string> = {
  neutral: "bg-[#f5f5f5] text-[#4d4d4d]",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-sky-50 text-sky-700"
};

const statusToneClassDark: Record<string, string> = {
  neutral: "bg-neutral-800 text-neutral-300",
  success: "bg-emerald-900/50 text-emerald-400",
  warning: "bg-amber-900/50 text-amber-400",
  danger: "bg-red-900/50 text-red-400",
  info: "bg-sky-900/50 text-sky-400"
};

function StatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  return (
    <span className={cn(
      "inline-flex rounded-[8px] px-3 py-1 text-xs font-semibold",
      "bg-[#f5f5f5] text-[#4d4d4d] dark:bg-neutral-800 dark:text-neutral-300",
      tone === "success" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
      tone === "warning" && "bg-amber-50 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
      tone === "danger" && "bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-400",
      tone === "info" && "bg-sky-50 text-sky-700 dark:bg-sky-900/50 dark:text-sky-400"
    )}>
      {children}
    </span>
  );
}

function AnalyticsCard({ label, value, change, icon: Icon }: { label: string; value: string; change: string; icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }> }) {
  return (
    <article className="rounded-[18px] border border-border bg-card p-5 shadow dark:shadow-teal-950/10">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-muted text-muted-foreground">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <p className="text-3xl font-semibold text-foreground">{value}</p>
        <p className="text-xs font-semibold text-muted-foreground">{change}</p>
      </div>
    </article>
  );
}

function SearchFilters({ placeholder = "Search records" }: { placeholder?: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-[18px] border border-border bg-card p-4 shadow dark:shadow-teal-950/10 md:flex-row md:items-center">
      <label className="relative flex-1">
        <input
          className="h-12 w-full rounded-[10px] border border-border bg-background pl-12 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder={placeholder}
        />
      </label>
      <button className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-border bg-card px-5 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground">
        Filters
      </button>
    </div>
  );
}

function AdvancedTable({ rows, columns }: { rows: Array<{ id: string; time: string; patient: string; doctor: string; type: string; status: string; tone: string }>; columns: Array<{ key: string; header: string; render: (row: typeof rows[0]) => React.ReactNode }> }) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-border bg-card shadow dark:shadow-teal-950/10">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-4 font-semibold">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-muted/40">
                {columns.map((column) => (
                  <td key={column.key} className="px-5 py-4 text-foreground">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QueueList({ items }: { items: Array<{ id: string; time: string; patient: string; resource: string; status: string; tone?: string }> }) {
  return (
    <section className="rounded-[18px] border border-border bg-card shadow dark:shadow-teal-950/10">
      <header className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">Live Queue</h2>
        <p className="mt-1 text-sm text-muted-foreground">Front desk, nurse, and provider handoff.</p>
      </header>
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div key={item.id} className="grid gap-3 px-5 py-4 md:grid-cols-[80px_1fr_auto] md:items-center">
            <p className="font-semibold text-foreground">{item.time}</p>
            <div>
              <p className="font-medium text-foreground">{item.patient}</p>
              <p className="text-sm text-muted-foreground">{item.resource}</p>
            </div>
            <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DashboardView() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Main Branch</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground md:text-4xl">Clinic Command Center</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Fast front-desk flow, secure clinical records, branch-aware operations, and AI assistance in one workspace.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="h-12 cursor-pointer rounded-[10px] border border-border bg-card px-6 text-sm font-semibold text-foreground transition hover:border-primary">
            Patient Intake
          </button>
          <button className="h-12 cursor-pointer rounded-[10px] bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
            Book Visit
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <AnalyticsCard key={metric.label} {...metric} />
        ))}
      </div>

      <SearchFilters placeholder="Search patients, MRNs, appointments, invoices" />

      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.9fr]">
        <AdvancedTable
          rows={appointments}
          columns={[
            { key: "time", header: "Time", render: (row) => <span className="font-semibold">{row.time}</span> },
            { key: "patient", header: "Patient", render: (row) => row.patient },
            { key: "doctor", header: "Doctor", render: (row) => <span className="text-muted-foreground">{row.doctor}</span> },
            { key: "type", header: "Visit", render: (row) => <span className="text-muted-foreground">{row.type}</span> },
            { key: "status", header: "Status", render: (row) => <StatusBadge tone={row.tone}>{row.status}</StatusBadge> }
          ]}
        />

        <aside className="rounded-[18px] border border-border bg-card p-5 shadow dark:shadow-teal-950/10">
          <div className="flex items-center gap-4">
            <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">AI Workflow Assistant</h2>
              <p className="mt-1 text-sm text-muted-foreground">Operational suggestions</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {[
              "Summarize intake notes for Mason Lee before rooming.",
              "Send WhatsApp reminders for tomorrow's first 12 appointments.",
              "Flag three open invoices that can be collected at check-in."
            ].map((item) => (
              <button key={item} className="w-full cursor-pointer rounded-[10px] border border-border bg-muted/50 p-4 text-left text-sm text-foreground transition hover:border-primary hover:bg-muted">
                {item}
              </button>
            ))}
          </div>
        </aside>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr_1.2fr]">
        <CalendarPanel />
        <ChartPanel />
        <QueueList
          items={appointments.map((appointment) => ({
            id: appointment.id,
            time: appointment.time,
            patient: appointment.patient,
            resource: appointment.doctor,
            status: appointment.status,
            tone: appointment.tone
          }))}
        />
      </div>
    </section>
  );
}

function CalendarPanel() {
  const days = [
    { date: "Mon", count: 38 },
    { date: "Tue", count: 42, active: true },
    { date: "Wed", count: 35 },
    { date: "Thu", count: 47 },
    { date: "Fri", count: 31 },
    { date: "Sat", count: 12 },
    { date: "Sun", count: 0 }
  ];

  return (
    <section className="rounded-[18px] border border-border bg-card p-5 shadow dark:shadow-teal-950/10">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-muted text-muted-foreground">
          <CalendarClock className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="text-base font-semibold text-foreground">Schedule Density</h2>
      </div>
      <div className="grid grid-cols-7 gap-3">
        {days.map((day) => (
          <button
            key={day.date}
            className={cn(
              "aspect-square cursor-pointer rounded-[10px] border border-border bg-muted/50 p-3 text-left text-xs transition hover:border-primary dark:bg-muted",
              day.active && "border-primary bg-primary text-primary-foreground"
            )}
          >
            <span className="block font-semibold text-foreground">{day.date}</span>
            <span className={cn("mt-1 block text-muted-foreground", day.active && "text-primary-foreground/80")}>{day.count}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ChartPanel() {
  const values = [18, 22, 19, 27, 32, 29, 36, 41];
  const max = Math.max(...values, 1);

  return (
    <section className="rounded-[18px] border border-border bg-card p-5 shadow dark:shadow-teal-950/10">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-muted text-muted-foreground">
          <CircleDollarSign className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="text-base font-semibold text-foreground">Revenue Trend</h2>
      </div>
      <div className="flex h-44 items-end gap-3">
        {values.map((value, index) => (
          <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t bg-primary/80" style={{ height: `${Math.max((value / max) * 100, 8)}%` }} />
            <span className="text-xs text-muted-foreground">{index + 1}</span>
          </div>
        ))}
      </div>
    </section>
  );
}