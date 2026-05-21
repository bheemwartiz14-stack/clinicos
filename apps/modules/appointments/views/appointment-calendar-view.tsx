import type { AppointmentRecord } from "../types/appointment.types";
import { AppointmentCalendar } from "../components/appointment-calendar";
import { AppointmentFilters } from "../components/appointment-filters";

export function AppointmentCalendarView({ appointments }: { appointments: AppointmentRecord[] }) {
  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-3xl font-semibold text-foreground">Appointment Calendar</h1>
        <p className="mt-2 text-sm text-muted-foreground">Day, week, and month scheduling with doctor, department, branch, and search filtering.</p>
      </section>
      <AppointmentFilters />
      <AppointmentCalendar appointments={appointments} />
    </div>
  );
}
