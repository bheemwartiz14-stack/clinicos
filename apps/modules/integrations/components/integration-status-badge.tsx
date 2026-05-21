import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import type { IntegrationStatus } from "../types/integration.types";

export function IntegrationStatusBadge({ status }: { status?: IntegrationStatus | null }) {
  const value = status ?? "disconnected";
  const styles = {
    connected: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300",
    disconnected: "bg-muted text-muted-foreground border-border",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
    expired: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300"
  }[value];
  const Icon = value === "connected" ? CheckCircle : value === "failed" ? AlertCircle : Clock;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${styles}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {value.replace("_", " ")}
    </span>
  );
}
