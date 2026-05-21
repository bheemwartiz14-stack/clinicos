import type { AppointmentStatus } from "../schemas/appointment.schema";

export function appointmentRange(date: string, startTime: string, durationMinutes: number) {
  const startsAt = new Date(`${date}T${startTime}:00`);
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);
  return { startsAt, endsAt };
}

export function assertCanTransition(currentStatus: string, nextStatus: AppointmentStatus) {
  if (currentStatus === "cancelled" && nextStatus === "checked_in") {
    throw new Error("Cancelled appointment cannot be checked in.");
  }
  if (currentStatus === "no_show" && nextStatus === "completed") {
    throw new Error("No-show appointment cannot be completed.");
  }
}

export function assertCanReschedule(currentStatus: string) {
  if (currentStatus === "completed") throw new Error("Completed appointment cannot be rescheduled.");
  if (currentStatus === "cancelled") throw new Error("Cancelled appointment cannot be rescheduled.");
}

export function assertFutureAppointment(startsAt: Date) {
  if (startsAt <= new Date()) throw new Error("Appointment cannot be booked in the past.");
}
