"use client";

import { CalendarDays, Filter, LineChart, Search, X } from "lucide-react";
import { cn } from "@mediclinic/ui";

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const statusToneClass: Record<StatusTone, string> = {
  neutral: "bg-[#f5f5f5] text-[#4d4d4d]",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  info: "bg-sky-50 text-sky-700"
};

export function StatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: StatusTone }) {
  return <span className={cn("inline-flex rounded-[8px] px-3 py-1 text-xs font-semibold", statusToneClass[tone])}>{children}</span>;
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
    <article className="rounded-[18px] border border-[#e5e5e5] bg-[#ffffff] p-5 shadow-[rgba(0,0,0,0.1)_0px_1px_3px_0px,rgba(0,0,0,0.1)_0px_1px_2px_-1px]">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#666666]">{label}</p>
        <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#888888]/10 text-[#888888]">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <p className="text-3xl font-semibold text-[#000000]">{value}</p>
        <p className="text-xs font-semibold text-[#888888]">{change}</p>
      </div>
    </article>
  );
}

export function SearchFilters({ placeholder = "Search records" }: { placeholder?: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-[18px] border border-[#e5e5e5] bg-[#ffffff] p-4 shadow-[rgba(0,0,0,0.1)_0px_1px_3px_0px,rgba(0,0,0,0.1)_0px_1px_2px_-1px] md:flex-row md:items-center">
      <label className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" aria-hidden />
        <input
          className="h-12 w-full rounded-[10px] border border-[#e5e5e5] bg-[#ffffff] pl-12 pr-4 text-sm text-[#000000] outline-none transition-all placeholder:text-[#999999] focus:border-[#888888] focus:ring-2 focus:ring-[#888888]/10"
          placeholder={placeholder}
        />
      </label>
      <button className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#e5e5e5] bg-[#ffffff] px-5 text-sm font-semibold text-[#666666] transition-all hover:border-[#888888]">
        <Filter className="h-4 w-4" aria-hidden />
        Filters
      </button>
    </div>
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
    <div className="overflow-hidden rounded-[18px] border border-[#e5e5e5] bg-[#ffffff] shadow-[rgba(0,0,0,0.1)_0px_1px_3px_0px,rgba(0,0,0,0.1)_0px_1px_2px_-1px]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[#f5f5f5]/60 text-xs uppercase text-[#666666]">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-4 font-semibold">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5e5]">
            {rows.map((row) => (
              <tr key={row.id} className={cn("transition hover:bg-[#f5f5f5]/40", getRowClassName?.(row))}>
                {columns.map((column) => (
                  <td key={column.key} className="px-5 py-4 text-[#000000]">
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

export function DrawerForm({ title, open, children, onClose }: { title: string; open: boolean; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#000]/20">
      <aside className="ml-auto flex h-full w-full max-w-lg flex-col border-l border-[#e5e5e5] bg-[#ffffff] shadow-xl">
        <header className="flex items-center justify-between border-b border-[#e5e5e5] px-5 py-4">
          <h2 className="text-base font-semibold text-[#000000]">{title}</h2>
          <button onClick={onClose} className="grid h-10 w-10 cursor-pointer place-items-center rounded-[10px] border border-[#e5e5e5] text-[#666666] transition-all hover:border-[#888888]" aria-label="Close drawer">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}

export function ModalDialog({ title, open, children, onClose }: { title: string; open: boolean; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#000]/20 px-4">
      <section className="w-full max-w-md rounded-[18px] border border-[#e5e5e5] bg-[#ffffff] shadow-xl">
        <header className="flex items-center justify-between border-b border-[#e5e5e5] px-5 py-4">
          <h2 className="text-base font-semibold text-[#000000]">{title}</h2>
          <button onClick={onClose} className="grid h-10 w-10 cursor-pointer place-items-center rounded-[10px] border border-[#e5e5e5] text-[#666666] transition-all hover:border-[#888888]" aria-label="Close modal">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}

export function CalendarPanel({ days }: { days: Array<{ date: string; count: number; active?: boolean }> }) {
  return (
    <section className="rounded-[18px] border border-[#e5e5e5] bg-[#ffffff] p-5 shadow-[rgba(0,0,0,0.1)_0px_1px_3px_0px,rgba(0,0,0,0.1)_0px_1px_2px_-1px]">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#888888]/10 text-[#888888]">
          <CalendarDays className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="text-base font-semibold text-[#000000]">Schedule Density</h2>
      </div>
      <div className="grid grid-cols-7 gap-3">
        {days.map((day) => (
          <button
            key={day.date}
            className={cn(
              "aspect-square cursor-pointer rounded-[10px] border border-[#e5e5e5] bg-[#fafafa] p-3 text-left text-xs transition-all hover:border-[#888888]",
              day.active && "border-[#888888] bg-[#888888] text-[#ffffff]"
            )}
          >
            <span className="block font-semibold text-[#000000]">{day.date}</span>
            <span className={cn("mt-1 block text-[#666666]", day.active && "text-[#ffffff]/80")}>{day.count}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function ChartPanel({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);

  return (
    <section className="rounded-[18px] border border-[#e5e5e5] bg-[#ffffff] p-5 shadow-[rgba(0,0,0,0.1)_0px_1px_3px_0px,rgba(0,0,0,0.1)_0px_1px_2px_-1px]">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#888888]/10 text-[#888888]">
          <LineChart className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="text-base font-semibold text-[#000000]">Revenue Trend</h2>
      </div>
      <div className="flex h-44 items-end gap-3">
        {values.map((value, index) => (
          <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t bg-[#888888]/80" style={{ height: `${Math.max((value / max) * 100, 8)}%` }} />
            <span className="text-xs text-[#666666]">{index + 1}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function QueueList({
  items
}: {
  items: Array<{ id: string; time: string; patient: string; resource: string; status: string; tone?: StatusTone }>;
}) {
  return (
    <section className="rounded-[18px] border border-[#e5e5e5] bg-[#ffffff] shadow-[rgba(0,0,0,0.1)_0px_1px_3px_0px,rgba(0,0,0,0.1)_0px_1px_2px_-1px]">
      <header className="border-b border-[#e5e5e5] px-5 py-4">
        <h2 className="text-base font-semibold text-[#000000]">Live Queue</h2>
        <p className="mt-1 text-sm text-[#666666]">Front desk, nurse, and provider handoff.</p>
      </header>
      <div className="divide-y divide-[#e5e5e5]">
        {items.map((item) => (
          <div key={item.id} className="grid gap-3 px-5 py-4 md:grid-cols-[80px_1fr_auto] md:items-center">
            <p className="font-semibold text-[#000000]">{item.time}</p>
            <div>
              <p className="font-medium text-[#000000]">{item.patient}</p>
              <p className="text-sm text-[#666666]">{item.resource}</p>
            </div>
            <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
          </div>
        ))}
      </div>
    </section>
  );
}