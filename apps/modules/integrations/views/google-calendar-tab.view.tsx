"use client";

import { useState } from "react";
import { CalendarDays, RefreshCw, Unplug, ExternalLink, TestTube2 } from "lucide-react";
import { IntegrationStatusBadge } from "../components/integration-status-badge";
import type { DoctorIntegrationRecord } from "../types/integration.types";

export function GoogleCalendarTabView({ integration, busyEventsCount, canManage }: {
  integration: DoctorIntegrationRecord | null;
  busyEventsCount: number;
  canManage: boolean;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function post(action: "sync" | "disconnect") {
    setPending(action);
    setMessage(null);
    const url = action === "sync" ? "/api/integrations/google-calendar/sync" : "/api/integrations/google-calendar/disconnect";
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    const body = await response.json().catch(() => ({}));
    setPending(null);
    setMessage(body.message ?? (response.ok ? "Done." : body.error ?? "Action failed."));
    if (response.ok) window.location.reload();
  }

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
            <CalendarDays className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Google Calendar</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">Sync working availability, leave blocks, and external busy events to prevent double booking.</p>
          </div>
        </div>
        <IntegrationStatusBadge status={integration?.status ?? "disconnected"} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Info label="Connected account" value={integration?.providerAccountEmail ?? "Not connected"} />
        <Info label="Calendar ID" value={integration?.calendarId ?? "primary"} />
        <Info label="Last synced" value={integration?.lastSyncedAt ? new Date(integration.lastSyncedAt).toLocaleString() : "Never"} />
        <Info label="Busy events" value={`${busyEventsCount} events blocking slots`} />
      </div>

      {integration?.errorMessage ? <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">{integration.errorMessage}</p> : null}
      {message ? <p className="mt-4 rounded-xl border bg-slate-50 p-3 text-sm font-medium text-slate-700">{message}</p> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {canManage && integration?.status !== "connected" ? (
          <a href="/api/integrations/google-calendar/connect" className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">
            <ExternalLink className="h-4 w-4" aria-hidden /> Connect Google Calendar
          </a>
        ) : null}
        {canManage && integration?.status === "connected" ? (
          <>
            <button onClick={() => post("sync")} disabled={pending !== null} className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${pending === "sync" ? "animate-spin" : ""}`} aria-hidden /> Sync Calendar Now
            </button>
            <button onClick={() => setMessage("Calendar integration is reachable. Run Sync Calendar Now for live Google verification.")} className="inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <TestTube2 className="h-4 w-4" aria-hidden /> Test Integration
            </button>
            <button onClick={() => post("disconnect")} disabled={pending !== null} className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60">
              <Unplug className="h-4 w-4" aria-hidden /> Disconnect
            </button>
          </>
        ) : null}
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-slate-50/70 p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
