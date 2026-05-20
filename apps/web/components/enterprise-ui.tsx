"use client";

import { CalendarDays, Filter, LineChart, Search, X } from "lucide-react";
import { cn } from "@mediclinic/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const statusToneClass: Record<StatusTone, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  success: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/14 text-amber-700 dark:text-amber-300",
  danger: "bg-destructive/12 text-destructive dark:text-red-300",
  info: "bg-sky-500/12 text-sky-700 dark:text-sky-300"
};

export function StatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: StatusTone }) {
  return <Badge className={cn("border-transparent", statusToneClass[tone])}>{children}</Badge>;
}

export function AnalyticsCard({
  label,
  value,
  change,
  icon: Icon
}: {
  label: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <Card>
      <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="grid h-10 w-10 place-items-center rounded-md bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <p className="text-3xl font-semibold text-foreground">{value}</p>
        <p className="text-xs font-semibold text-muted-foreground">{change}</p>
      </div>
      </CardContent>
    </Card>
  );
}

export function SearchFilters({ placeholder = "Search records" }: { placeholder?: string }) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <label className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          className="h-12 pl-12"
          placeholder={placeholder}
        />
      </label>
      <Button variant="outline" className="h-12 px-5">
        <Filter className="h-4 w-4" aria-hidden />
        Filters
      </Button>
      </div>
    </Card>
  );
}

export function AdvancedTable<T extends { id: string }>({
  columns,
  rows,
  getRowClassName
}: {
  columns: Array<{ key: string; header: string; render: (row: T) => React.ReactNode }>;
  rows: T[];
  getRowClassName?: (row: T) => string;
}) {
  return (
    <Card className="overflow-hidden">
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
              <tr key={row.id} className={cn("transition hover:bg-muted/40", getRowClassName?.(row))}>
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
    </Card>
  );
}

export function DrawerForm({ title, open, children, onClose }: { title: string; open: boolean; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm">
      <aside className="ml-auto flex h-full w-full max-w-lg flex-col border-l bg-card text-card-foreground shadow-xl">
        <header className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <Button type="button" variant="outline" size="icon" onClick={onClose} aria-label="Close drawer">
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}

export function ModalDialog({ title, open, children, onClose }: { title: string; open: boolean; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 px-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-xl">
        <header className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <Button type="button" variant="outline" size="icon" onClick={onClose} aria-label="Close modal">
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}

export function CalendarPanel({ days }: { days: Array<{ date: string; count: number; active?: boolean }> }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-accent text-accent-foreground">
          <CalendarDays className="h-5 w-5" aria-hidden />
        </div>
        <CardTitle>Schedule Density</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="grid grid-cols-7 gap-3">
        {days.map((day) => (
          <button
            key={day.date}
            className={cn(
              "aspect-square cursor-pointer rounded-md border bg-muted/50 p-3 text-left text-xs transition-all hover:border-primary",
              day.active && "border-primary bg-primary text-primary-foreground"
            )}
          >
            <span className={cn("block font-semibold text-foreground", day.active && "text-primary-foreground")}>{day.date}</span>
            <span className={cn("mt-1 block text-muted-foreground", day.active && "text-primary-foreground/80")}>{day.count}</span>
          </button>
        ))}
      </div>
      </CardContent>
    </Card>
  );
}

export function ChartPanel({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-accent text-accent-foreground">
          <LineChart className="h-5 w-5" aria-hidden />
        </div>
        <CardTitle>Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent>
      <div className="flex h-44 items-end gap-3">
        {values.map((value, index) => (
          <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t bg-primary/80" style={{ height: `${Math.max((value / max) * 100, 8)}%` }} />
            <span className="text-xs text-muted-foreground">{index + 1}</span>
          </div>
        ))}
      </div>
      </CardContent>
    </Card>
  );
}

export function QueueList({
  items
}: {
  items: Array<{ id: string; time: string; patient: string; resource: string; status: string; tone?: StatusTone }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Queue</CardTitle>
        <p className="text-sm text-muted-foreground">Front desk, nurse, and provider handoff.</p>
      </CardHeader>
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
    </Card>
  );
}
