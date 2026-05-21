"use client";

import type { CalendarAppointment, TimeSlot } from "../types/appointment.types";
import { AppointmentCard } from "./appointment-card";

export function AppointmentTimeRow({
  slot,
  appointments,
  onEmptySlot,
  onAppointment
}: {
  slot: TimeSlot;
  appointments: CalendarAppointment[];
  onEmptySlot: () => void;
  onAppointment: (appointment: CalendarAppointment) => void;
}) {
  return (
    <div className="min-h-20 border-b p-2">
      {appointments.length > 0 ? (
        <div className="space-y-2">
          {appointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} onOpen={onAppointment} />)}
        </div>
      ) : (
        <button type="button" onClick={onEmptySlot} className="h-16 w-full rounded-lg border border-dashed text-xs text-muted-foreground transition hover:border-primary hover:bg-primary/5">
          {slot.label}
        </button>
      )}
    </div>
  );
}
