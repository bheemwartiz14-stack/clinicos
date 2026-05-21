import type { TimeSlot } from "../types/appointment.types";

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function buildTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let hour = 9; hour < 17; hour += 1) {
    for (const minute of [0, 30]) {
      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const label = new Date(`2000-01-01T${value}:00`).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      slots.push({ value, label });
    }
  }
  return slots;
}

export function addMinutes(time: string, minutes: number) {
  const date = new Date(`2000-01-01T${time}:00`);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toTimeString().slice(0, 5);
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}
