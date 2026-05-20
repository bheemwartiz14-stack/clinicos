import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import type { IntegrationStatus } from "../types/integration.types";

export function IntegrationStatusBadge({ status }: { status?: IntegrationStatus | null }) {
  const value = status ?? "disconnected";
  const styles = {
    connected: "bg-emerald-50 text-emerald-700 border-emerald-200",
    disconnected: "bg-slate-50 text-slate-600 border-slate-200",
    failed: "bg-rose-50 text-rose-700 border-rose-200",
    expired: "bg-amber-50 text-amber-700 border-amber-200"
  }[value];
  const Icon = value === "connected" ? CheckCircle : value === "failed" ? AlertCircle : Clock;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${styles}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {value.replace("_", " ")}
    </span>
  );
}
