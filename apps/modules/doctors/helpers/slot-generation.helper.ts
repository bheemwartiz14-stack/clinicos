import type { DoctorRecord, DoctorSchedule, DoctorSlotInsert } from "../types/doctor.types";

const dayIndexByName = new Map([
  ["sunday", 0],
  ["monday", 1],
  ["tuesday", 2],
  ["wednesday", 3],
  ["thursday", 4],
  ["friday", 5],
  ["saturday", 6]
]);

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toMinutes(time: string) {
  const [hours = "0", minutes = "0"] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
}

function toTime(minutes: number) {
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
}

export function buildDoctorSlots(params: {
  doctor: Pick<DoctorRecord, "id" | "isActive" | "isAvailable">;
  schedules: DoctorSchedule[];
  existingSlotKeys: Set<string>;
  startDate?: Date;
  days?: number;
}): DoctorSlotInsert[] {
  const days = params.days ?? 30;
  const startDate = params.startDate ?? new Date();
  const slots: DoctorSlotInsert[] = [];

  if (!params.doctor.isActive || !params.doctor.isAvailable) return slots;

  for (let offset = 0; offset < days; offset += 1) {
    const slotDate = addDays(startDate, offset);
    const slotDateKey = dateKey(slotDate);
    const daySchedules = params.schedules.filter((schedule) => {
      return schedule.isActive && dayIndexByName.get(schedule.dayOfWeek) === slotDate.getDay();
    });

    for (const schedule of daySchedules) {
      let cursor = toMinutes(schedule.startTime);
      const end = toMinutes(schedule.endTime);

      while (cursor + schedule.slotDuration <= end) {
        const startTime = toTime(cursor);
        const endTime = toTime(cursor + schedule.slotDuration);
        const slotKey = `${slotDateKey}|${startTime}|${endTime}`;

        if (!params.existingSlotKeys.has(slotKey)) {
          slots.push({
            doctorId: params.doctor.id,
            scheduleId: schedule.id,
            slotDate: slotDateKey,
            startTime,
            endTime,
            status: "available"
          });
          params.existingSlotKeys.add(slotKey);
        }

        cursor += schedule.slotDuration;
      }
    }
  }

  return slots;
}
