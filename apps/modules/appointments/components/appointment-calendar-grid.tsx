"use client";

import type { AppointmentDoctorOption, CalendarAppointment, TimeSlot } from "../types/appointment.types";
import { AppointmentDoctorColumn } from "./appointment-doctor-column";

export function AppointmentCalendarGrid({
  doctors,
  appointments,
  timeSlots,
  onEmptySlot,
  onAppointment
}: {
  doctors: AppointmentDoctorOption[];
  appointments: CalendarAppointment[];
  timeSlots: TimeSlot[];
  onEmptySlot: (doctorId: string, time: string) => void;
  onAppointment: (appointment: CalendarAppointment) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <div className="flex min-w-max">
        <div className="w-24 shrink-0 border-r bg-muted/40">
          <div className="sticky top-0 z-10 h-20 border-b bg-card p-3 text-xs font-semibold uppercase text-muted-foreground">Time</div>
          {timeSlots.map((slot) => <div key={slot.value} className="flex h-20 items-start border-b p-2 text-xs font-medium text-muted-foreground">{slot.label}</div>)}
        </div>
        {doctors.map((doctor) => (
          <AppointmentDoctorColumn
            key={doctor.id}
            doctor={doctor}
            timeSlots={timeSlots}
            appointments={appointments.filter((appointment) => appointment.doctorId === doctor.id)}
            onEmptySlot={onEmptySlot}
            onAppointment={onAppointment}
          />
        ))}
      </div>
    </div>
  );
}
