import { CalendarPlus, Clock, Stethoscope, Users } from "lucide-react";

const appointments = [
  ["09:30 AM", "Priya Raman", "Dr. Smith", "Follow-up consultation", "Confirmed"],
  ["11:00 AM", "Emma Watson", "Dr. Brown", "General checkup", "Waiting"],
  ["01:15 PM", "Michael Lee", "Dr. Wilson", "Lab review", "Confirmed"],
  ["03:45 PM", "Anita Verma", "Dr. Smith", "New patient visit", "Pending"],
];

export default function AppointmentsPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Appointments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track today&apos;s queue, visit reasons, and doctor schedules.
          </p>
        </div>

        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          type="button"
        >
          <CalendarPlus className="size-4" />
          New appointment
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Today", "86", Clock],
          ["Doctors active", "12", Stethoscope],
          ["Patients queued", "18", Users],
        ].map(([label, value, Icon]) => (
          <div key={label as string} className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label as string}</p>
              <Icon className="size-5 text-primary" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-foreground">{value as string}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <h2 className="font-semibold text-foreground">Today&apos;s Schedule</h2>
        <div className="mt-5 space-y-3">
          {appointments.map(([time, patient, doctor, reason, status]) => (
            <div
              key={`${time}-${patient}`}
              className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                  {time}
                </div>
                <div>
                  <p className="font-medium text-foreground">{patient}</p>
                  <p className="text-sm text-muted-foreground">
                    {doctor} - {reason}
                  </p>
                </div>
              </div>
              <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
