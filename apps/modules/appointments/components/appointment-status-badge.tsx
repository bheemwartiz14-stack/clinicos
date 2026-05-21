import type { AppointmentStatus } from "../types/appointment.types";

const tones: Record<AppointmentStatus, string> = {
  scheduled: "bg-amber-50 text-amber-700",
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-teal-50 text-teal-700",
  checked_in: "bg-sky-50 text-sky-700",
  in_room: "bg-indigo-50 text-indigo-700",
  in_consultation: "bg-indigo-50 text-indigo-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-700",
  no_show: "bg-slate-100 text-slate-700",
  rescheduled: "bg-violet-50 text-violet-700"
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tones[status]}`}>{status.replaceAll("_", " ")}</span>;
}
