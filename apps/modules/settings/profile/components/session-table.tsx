import { ShieldX } from "lucide-react";
import { revokeSessionAction } from "../actions/settings.actions";
import type { SessionRecord } from "../types/settings.types";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export function SessionTable({ sessions }: { sessions: SessionRecord[] }) {
  return (
    <section className="rounded-xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-teal-950/5 backdrop-blur">
      <h2 className="text-lg font-semibold text-slate-950">Active Login Sessions</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="border-b border-slate-200 py-3">Device</th>
              <th className="border-b border-slate-200 py-3">IP</th>
              <th className="border-b border-slate-200 py-3">Last seen</th>
              <th className="border-b border-slate-200 py-3">Expires</th>
              <th className="border-b border-slate-200 py-3">Status</th>
              <th className="border-b border-slate-200 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-b border-slate-100">
                <td className="py-3">
                  <p className="font-semibold text-slate-900">{session.deviceName ?? session.browser ?? "Unknown device"}</p>
                  <p className="text-xs text-slate-500">{session.os ?? session.userAgent ?? "No device details"}</p>
                </td>
                <td className="py-3 text-slate-600">{session.ipAddress ?? "Unknown"}</td>
                <td className="py-3 text-slate-600">{formatDate(session.lastSeenAt)}</td>
                <td className="py-3 text-slate-600">{formatDate(session.expiresAt)}</td>
                <td className="py-3">
                  <span className={session.revokedAt ? "rounded-lg bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700" : "rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"}>
                    {session.current ? "Current" : session.revokedAt ? "Revoked" : "Active"}
                  </span>
                </td>
                <td className="py-3 text-right">
                  {!session.current && !session.revokedAt ? (
                    <form action={async (formData) => {
                      "use server";
                      await revokeSessionAction(formData);
                    }}>
                      <input type="hidden" name="sessionId" value={session.id} />
                      <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700">
                        <ShieldX className="h-3.5 w-3.5" aria-hidden />
                        Revoke
                      </button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
