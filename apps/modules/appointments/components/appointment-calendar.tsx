import type { CalendarAppointment } from "../types/appointment.types";
import { AppointmentStatusBadge } from "./appointment-status-badge";

export function AppointmentCalendar({ appointments }: { appointments: CalendarAppointment[] }) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Calendar grid</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {appointments.map((appointment) => (
          <article key={appointment.id} className="rounded-xl border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">
                {appointment.appointmentDate} {appointment.startTime}
              </p>
              <AppointmentStatusBadge status={appointment.status} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{appointment.patientName}</p>
            <p className="mt-1 text-xs text-muted-foreground">Dr. {appointment.doctorName}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
