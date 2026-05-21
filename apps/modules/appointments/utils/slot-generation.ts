import { rangesOverlap } from "./overlap";

type GenerateSlotsInput = {
  doctorId: string;
  date: Date;
  workStart?: string;
  workEnd?: string;
  visitDurationMinutes?: number;
  bufferMinutes?: number;
  appointments?: any[];
  busyRanges?: Array<{ startsAt: Date; endsAt: Date; reason: string }>;
};

function atTime(date: Date, time: string) {
  const [hours = "9", minutes = "0"] = time.split(":");
  const next = new Date(date);
  next.setHours(Number(hours), Number(minutes), 0, 0);
  return next;
}

export function generateSlots(input: GenerateSlotsInput): any[] {
  const duration = input.visitDurationMinutes ?? 20;
  const buffer = input.bufferMinutes ?? 5;
  const slots =  [];
  let cursor = atTime(input.date, input.workStart ?? "09:00");
  const end = atTime(input.date, input.workEnd ?? "17:00");
  while (cursor < end) {
    const slotEnd = new Date(cursor.getTime() + duration * 60_000);
    if (slotEnd > end) break;
    const booked = input.appointments?.some((appointment) => rangesOverlap(cursor, slotEnd, new Date(appointment.startsAt), new Date(appointment.endsAt)));
    const busy = input.busyRanges?.find((range) => rangesOverlap(cursor, slotEnd, range.startsAt, range.endsAt));
    slots.push({
      doctorId: input.doctorId,
      startsAt: cursor,
      endsAt: slotEnd,
      status: booked ? "booked" : busy ? "calendar_busy" : "available",
      reason: booked ? "Existing appointment" : busy?.reason ?? "Open slot",
      score: booked || busy ? 0 : 0.9
    });
    cursor = new Date(slotEnd.getTime() + buffer * 60_000);
  }

  return slots;
}
