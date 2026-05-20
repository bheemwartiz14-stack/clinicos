import type { LoginHistoryRecord } from "../types/settings.types";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export function LoginHistoryTable({ records }: { records: LoginHistoryRecord[] }) {
  return (
    <section className="rounded-xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-teal-950/5 backdrop-blur">
      <h2 className="text-lg font-semibold text-slate-950">Login History</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="border-b border-slate-200 py-3">Date</th>
              <th className="border-b border-slate-200 py-3">Device</th>
              <th className="border-b border-slate-200 py-3">IP</th>
              <th className="border-b border-slate-200 py-3">Location</th>
              <th className="border-b border-slate-200 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.length ? records.map((record) => (
              <tr key={record.id} className="border-b border-slate-100">
                <td className="py-3 text-slate-700">{formatDate(record.createdAt)}</td>
                <td className="py-3">
                  <p className="font-semibold text-slate-900">{record.deviceName ?? "Unknown device"}</p>
                  <p className="max-w-xs truncate text-xs text-slate-500">{record.userAgent ?? "No user agent"}</p>
                </td>
                <td className="py-3 text-slate-600">{record.ipAddress ?? "Unknown"}</td>
                <td className="py-3 text-slate-600">{record.location ?? "Unknown"}</td>
                <td className="py-3">
                  <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{record.status}</span>
                </td>
              </tr>
            )) : (
              <tr>
                <td className="py-8 text-center text-slate-500" colSpan={5}>No login history has been recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
