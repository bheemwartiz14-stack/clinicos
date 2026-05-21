// @ts-nocheck
"use client";

import { useState } from "react";
import { CalendarDays, CheckCircle2, Clock, RefreshCw, Unplug, XCircle } from "lucide-react";
import type { DoctorCalendarConnection } from "../types/doctor.types";

function statusLabel(connection: DoctorCalendarConnection | null) {
  if (!connection?.isConnected) return { label: "Not connected", className: "bg-muted text-muted-foreground border-border", icon: Clock };
  if (connection.syncStatus === "failed") return { label: "Sync failed", className: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle };
  return { label: "Connected", className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300", icon: CheckCircle2 };
}

export function DoctorCalendarSyncCard({ connection, busyEventsCount }: { connection: DoctorCalendarConnection | null; busyEventsCount: number }) {
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const status = statusLabel(connection);
  const StatusIcon = status.icon;

  async function post(action: "sync" | "disconnect") {
    setPending(action);
    setMessage(null);
    const response = await fetch(`/api/doctor-calendar/google/${action}`, { method: "POST" });
    const body = await response.json().catch(() => ({}));
    setPending(null);
    setMessage(body.message ?? body.error ?? "Action completed.");
    if (response.ok) window.location.reload();
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-foreground/5">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <CalendarDays className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Google Calendar Integration</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Connect your Google Calendar to automatically sync your working hours and block dates. This helps prevent double-booking and keeps your availability up to date.
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>
          <StatusIcon className="h-3.5 w-3.5" aria-hidden />
          {status.label}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Info label="Connected account" value={connection?.providerAccountEmail ?? "Not connected"} />
        <Info label="Last synced" value={connection?.lastSyncedAt ? new Date(connection.lastSyncedAt).toLocaleString() : "Never"} />
        <Info label="Busy blocks" value={`${busyEventsCount} event(s) blocking slots`} />
      </div>

      {connection?.syncError ? <p className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm font-medium text-destructive">{connection.syncError}</p> : null}
      {message ? <p className="mt-4 rounded-xl border border-border bg-muted p-3 text-sm font-medium text-foreground">{message}</p> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {!connection?.isConnected ? (
          <a href="/api/doctor-calendar/google/connect" className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
            Connect Google Calendar
          </a>
        ) : (
          <>
            <button type="button" onClick={() => post("sync")} disabled={pending !== null} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${pending === "sync" ? "animate-spin" : ""}`} aria-hidden />
              Sync Now
            </button>
            <button type="button" onClick={() => post("disconnect")} disabled={pending !== null} className="inline-flex h-10 items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 text-sm font-semibold text-destructive transition hover:bg-destructive/20 disabled:opacity-60">
              <Unplug className="h-4 w-4" aria-hidden />
              Disconnect
            </button>
          </>
        )}
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
