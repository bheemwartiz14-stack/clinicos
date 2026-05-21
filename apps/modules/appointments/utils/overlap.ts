export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

export function assertValidRange(startsAt: Date, endsAt: Date) {
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    throw new Error("Appointment time is invalid.");
  }
  if (endsAt <= startsAt) {
    throw new Error("Appointment end time must be after start time.");
  }
}
