"use client";

import type { AppointmentDoctorOption, CalendarAppointment, TimeSlot } from "../types/appointment.types";
import { AppointmentTimeRow } from "./appointment-time-row";

export function AppointmentDoctorColumn({
  doctor,
  timeSlots,
  appointments,
  onEmptySlot,
  onAppointment
}: {
  doctor: AppointmentDoctorOption;
  timeSlots: TimeSlot[];
  appointments: CalendarAppointment[];
  onEmptySlot: (doctorId: string, time: string) => void;
  onAppointment: (appointment: CalendarAppointment) => void;
}) {
  return (
    <div className="min-w-72 border-r bg-card/40">
      <div className="sticky top-0 z-10 flex h-20 items-center gap-3 border-b bg-card p-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{doctor.initials}</div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{doctor.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{doctor.specialty}</p>
        </div>
      </div>
      {timeSlots.map((slot) => (
        <AppointmentTimeRow
          key={`${doctor.id}-${slot.value}`}
          slot={slot}
          appointments={appointments.filter((appointment) => appointment.startTime === slot.value)}
          onEmptySlot={() => onEmptySlot(doctor.id, slot.value)}
          onAppointment={onAppointment}
        />
      ))}
    </div>
  );
}
