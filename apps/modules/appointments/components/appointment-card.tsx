"use client";

import type { CalendarAppointment } from "../types/appointment.types";
import { AppointmentStatusBadge } from "./appointment-status-badge";

export function AppointmentCard({ appointment, onOpen }: { appointment: CalendarAppointment; onOpen: (appointment: CalendarAppointment) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(appointment)}
      className="w-full rounded-lg border bg-background p-2 text-left shadow-sm transition hover:border-primary/50 hover:bg-primary/5"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-semibold">{appointment.patientName}</p>
        <AppointmentStatusBadge status={appointment.status} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{appointment.startTime} - {appointment.endTime}</p>
      <p className="mt-1 text-xs capitalize text-muted-foreground">{appointment.type.replace("_", " ")}</p>
    </button>
  );
}
