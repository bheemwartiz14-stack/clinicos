import type { AppointmentRecord } from "../types/appointment.types";
import { rangesOverlap } from "./overlap";

export function isDoctorAvailable(input: { startsAt: Date; endsAt: Date; appointments: AppointmentRecord[] }) {
  return !input.appointments.some((appointment) =>
    !["cancelled", "no_show", "rescheduled"].includes(appointment.status) &&
    rangesOverlap(input.startsAt, input.endsAt, new Date(appointment.startsAt), new Date(appointment.endsAt))
  );
}
