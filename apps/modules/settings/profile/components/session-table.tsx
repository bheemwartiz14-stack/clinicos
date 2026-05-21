import { ShieldX } from "lucide-react";
import { revokeSessionAction } from "../actions/settings.actions";
import type { SessionRecord } from "../types/settings.types";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export function SessionTable({ sessions }: { sessions: SessionRecord[] }) {
  return (
    <section className="rounded-xl border border-border bg-card/80 p-5 shadow-lg shadow-foreground/5 backdrop-blur">
      <h2 className="text-lg font-semibold text-foreground">Active Login Sessions</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="border-b border-border py-3">Device</th>
              <th className="border-b border-border py-3">IP</th>
              <th className="border-b border-border py-3">Last seen</th>
              <th className="border-b border-border py-3">Expires</th>
              <th className="border-b border-border py-3">Status</th>
              <th className="border-b border-border py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-b border-border/70">
                <td className="py-3">
                  <p className="font-semibold text-foreground">{session.deviceName ?? session.browser ?? "Unknown device"}</p>
                  <p className="text-xs text-muted-foreground">{session.os ?? session.userAgent ?? "No device details"}</p>
                </td>
                <td className="py-3 text-muted-foreground">{session.ipAddress ?? "Unknown"}</td>
                <td className="py-3 text-muted-foreground">{formatDate(session.lastSeenAt)}</td>
                <td className="py-3 text-muted-foreground">{formatDate(session.expiresAt)}</td>
                <td className="py-3">
                  <span className={session.revokedAt ? "rounded-lg bg-rose-500/10 px-2 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300" : "rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"}>
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
                      <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-rose-300 hover:text-rose-700 dark:hover:text-rose-300">
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
