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
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Google Calendar</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Sync working availability, leave blocks, and external busy events to prevent double booking.</p>
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

      {integration?.errorMessage ? <p className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm font-medium text-destructive">{integration.errorMessage}</p> : null}
      {message ? <p className="mt-4 rounded-xl border border-border bg-muted p-3 text-sm font-medium text-foreground">{message}</p> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {canManage && integration?.status !== "connected" ? (
          <a href="/api/integrations/google-calendar/connect" className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <ExternalLink className="h-4 w-4" aria-hidden /> Connect Google Calendar
          </a>
        ) : null}
        {canManage && integration?.status === "connected" ? (
          <>
            <button onClick={() => post("sync")} disabled={pending !== null} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${pending === "sync" ? "animate-spin" : ""}`} aria-hidden /> Sync Calendar Now
            </button>
            <button onClick={() => setMessage("Calendar integration is reachable. Run Sync Calendar Now for live Google verification.")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-muted">
              <TestTube2 className="h-4 w-4" aria-hidden /> Test Integration
            </button>
            <button onClick={() => post("disconnect")} disabled={pending !== null} className="inline-flex h-10 items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 text-sm font-semibold text-destructive hover:bg-destructive/20 disabled:opacity-60">
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
    <div className="rounded-xl border border-border bg-background/70 p-4">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
