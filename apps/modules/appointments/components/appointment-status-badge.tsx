import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus } from "../schemas/appointment.schema";

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const variant = status === "cancelled" || status === "no_show" ? "destructive" : status === "completed" ? "secondary" : "default";
  return <Badge variant={variant} className="capitalize">{status.replace("_", " ")}</Badge>;
}
