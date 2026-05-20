"use client";

import { useRef, useState } from "react";
import { ExternalLink, Save, TestTube2, Unplug, Video } from "lucide-react";
import { IntegrationStatusBadge } from "../components/integration-status-badge";
import { MeetSettingsForm } from "../components/meet-settings-form";
import type { DoctorIntegrationRecord } from "../types/integration.types";

export function GoogleMeetTabView({ integration, canManage }: { integration: DoctorIntegrationRecord | null; canManage: boolean }) {
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const metadata = integration?.metadata ?? {};

  async function post(action: "test" | "disconnect") {
    setPending(action);
    setMessage(null);
    const url = action === "test" ? "/api/integrations/google-meet/test" : "/api/integrations/google-meet/disconnect";
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    const body = await response.json().catch(() => ({}));
    setPending(null);
    setMessage(body.message ?? (response.ok ? "Done." : body.error ?? "Action failed."));
    if (response.ok && action === "disconnect") window.location.reload();
  }

  async function saveSettings() {
    if (!formRef.current) return;
    setPending("save");
    setMessage(null);
    const formData = new FormData(formRef.current);
    const response = await fetch("/api/integrations/google-meet/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        autoCreateMeetLink: formData.get("autoCreateMeetLink") === "on",
        defaultOnlineConsultation: formData.get("defaultOnlineConsultation") === "on"
      })
    });
    const body = await response.json().catch(() => ({}));
    setPending(null);
    setMessage(body.message ?? (response.ok ? "Settings saved." : body.error ?? "Could not save settings."));
    if (response.ok) window.location.reload();
  }

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
            <Video className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Google Meet</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">Generate Google Meet links for online consultations using Google Calendar conference data.</p>
          </div>
        </div>
        <IntegrationStatusBadge status={integration?.status ?? "disconnected"} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Info label="Connected account" value={integration?.providerAccountEmail ?? "Not connected"} />
        <Info label="Last tested" value={integration?.lastTestedAt ? new Date(integration.lastTestedAt).toLocaleString() : "Never"} />
        <Info label="Default online consultation" value={metadata.defaultOnlineConsultation === true ? "Enabled" : "Disabled"} />
        <Info label="Auto-create Meet link" value={metadata.autoCreateMeetLink === false ? "Disabled" : "Enabled"} />
      </div>

      {message ? <p className="mt-4 rounded-xl border bg-slate-50 p-3 text-sm font-medium text-slate-700">{message}</p> : null}
      {integration?.errorMessage ? <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">{integration.errorMessage}</p> : null}

      <form ref={formRef} className="mt-6">
        <MeetSettingsForm metadata={metadata} disabled={!canManage || integration?.status !== "connected"} />
      </form>

      <div className="mt-6 flex flex-wrap gap-3">
        {canManage && integration?.status !== "connected" ? (
          <a href="/api/integrations/google-meet/connect" className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">
            <ExternalLink className="h-4 w-4" aria-hidden /> Connect Google Meet
          </a>
        ) : null}
        {canManage && integration?.status === "connected" ? (
          <>
            <button type="button" onClick={() => post("test")} disabled={pending !== null} className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
              <TestTube2 className="h-4 w-4" aria-hidden /> Test Google Meet Link
            </button>
            <button type="button" onClick={saveSettings} disabled={pending !== null} className="inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              <Save className="h-4 w-4" aria-hidden /> {pending === "save" ? "Saving..." : "Save Meet Settings"}
            </button>
            <button type="button" onClick={() => post("disconnect")} disabled={pending !== null} className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60">
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
