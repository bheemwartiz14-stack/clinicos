import type { AppointmentOption } from "../types/appointment.types";

export function WalkInBookingCard({ patients, doctors }: { patients: AppointmentOption[]; doctors: AppointmentOption[] }) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Walk-in booking</h2>
      <p className="mt-1 text-sm text-muted-foreground">Use the fast booking form with appointment type set to walk-in for instant token generation.</p>
      <p className="mt-4 text-xs text-muted-foreground">{patients.length} patients and {doctors.length} doctors ready for quick selection.</p>
    </section>
  );
}
