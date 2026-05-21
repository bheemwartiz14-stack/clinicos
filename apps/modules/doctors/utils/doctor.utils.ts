// @ts-nocheck
import type { DoctorSchedule, DoctorBreak, DoctorLeaveBlock, DoctorVisitSettings, DoctorAppointmentSlot, DoctorStatus, DoctorAvailabilityStatus, TimeSlot } from "../types/doctor.types";

function parseTime(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function getDoctorAvailabilityStatus(
  schedules: DoctorSchedule[],
  breaks: DoctorBreak[],
  leaveBlocks: DoctorLeaveBlock[],
  visitSettings: DoctorVisitSettings | null,
  slots: DoctorAppointmentSlot[],
  currentTime?: Date
): DoctorStatus {
  const now = currentTime ?? new Date();
  const dayOfWeek = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayDateStr = now.toISOString().split("T")[0];

  const leaveOngoing = leaveBlocks.find((leave) => {
    if (leave.status !== "approved") return false;
    const fromDate = new Date(leave.fromDate).toISOString().split("T")[0];
    const toDate = new Date(leave.toDate).toISOString().split("T")[0];
    return todayDateStr >= fromDate && todayDateStr <= toDate;
  });

  if (leaveOngoing) {
    const isOnLeaveFullDay = leaveOngoing.leaveType === "full_day";
    if (isOnLeaveFullDay) {
      return { status: "on_leave", label: "On Leave", color: "text-red-600" };
    }
    if (leaveOngoing.leaveType === "custom_time" && leaveOngoing.startTime && leaveOngoing.endTime) {
      const startMinutes = parseTime(leaveOngoing.startTime);
      const endMinutes = parseTime(leaveOngoing.endTime);
      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        return { status: "on_leave", label: "On Leave", color: "text-red-600" };
      }
    }
  }

  const activeBreaks = breaks.filter((b) => b.isEnabled);
  for (const brk of activeBreaks) {
    const startMinutes = parseTime(brk.startTime);
    const endMinutes = parseTime(brk.endTime);
    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return { status: "on_lunch", label: brk.breakType === "lunch" ? "On Lunch" : "On Break", color: "text-amber-600" };
    }
  }

  const todaySchedule = schedules.find((s) => s.dayOfWeek === dayOfWeek && s.isAvailable);
  if (!todaySchedule) {
    return { status: "not_scheduled", label: "Not Scheduled", color: "text-gray-500" };
  }

  const startMinutes = parseTime(todaySchedule.startTime);
  const endMinutes = parseTime(todaySchedule.endTime);

  if (currentMinutes < startMinutes || currentMinutes >= endMinutes) {
    return { status: "offline", label: "Offline", color: "text-gray-500" };
  }

  const currentSlot = slots.find((slot) => {
    const slotDate = new Date(slot.slotDate).toISOString().split("T")[0];
    if (slotDate !== todayDateStr) return false;
    const slotStart = parseTime(slot.startTime);
    const slotEnd = parseTime(slot.endTime);
    return currentMinutes >= slotStart && currentMinutes < slotEnd;
  });

  if (currentSlot?.status === "booked") {
    return { status: "busy", label: "Busy", color: "text-orange-600" };
  }

  return { status: "available", label: "Available", color: "text-green-600" };
}

export function generateTimeSlots(
  schedule: DoctorSchedule,
  breaks: DoctorBreak[],
  visitSettings: DoctorVisitSettings
): TimeSlot[] {
  if (!schedule.isAvailable) return [];

  const slots: TimeSlot[] = [];
  const visitDuration = visitSettings.visitDurationMinutes;
  const bufferTime = visitSettings.bufferTimeMinutes;
  const slotDuration = visitDuration + bufferTime;

  let currentTime = parseTime(schedule.startTime);
  const endTime = parseTime(schedule.endTime);

  const activeBreaks = breaks.filter((b) => b.isEnabled);
  const breakPeriods = activeBreaks.map((b) => ({
    start: parseTime(b.startTime),
    end: parseTime(b.endTime)
  }));

  while (currentTime + slotDuration <= endTime) {
    const slotStart = currentTime;
    const slotEnd = currentTime + visitDuration;

    const isInBreak = breakPeriods.some(
      (brk) => (slotStart >= brk.start && slotStart < brk.end) || (slotEnd > brk.start && slotEnd <= brk.end)
    );

    if (!isInBreak) {
      slots.push({
        startTime: formatTime(slotStart),
        endTime: formatTime(slotEnd)
      });
    }

    currentTime += slotDuration;
  }

  return slots;
}

export function generateAppointmentSlots(
  doctorId: string,
  startDate: Date,
  endDate: Date,
  schedules: DoctorSchedule[],
  breaks: DoctorBreak[],
  leaveBlocks: DoctorLeaveBlock[],
  visitSettings: DoctorVisitSettings,
  existingSlots: DoctorAppointmentSlot[]
): Array<{
  doctorId: string;
  slotDate: Date;
  startTime: string;
  endTime: string;
  status: "available" | "lunch" | "leave";
}> {
  const slots: Array<{
    doctorId: string;
    slotDate: Date;
    startTime: string;
    endTime: string;
    status: "available" | "lunch" | "leave";
  }> = [];

  const current = new Date(startDate);
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    const dateStr = current.toISOString().split("T")[0];

    const daySchedule = schedules.find((s) => s.dayOfWeek === dayOfWeek);
    if (!daySchedule || !daySchedule.isAvailable) {
      current.setDate(current.getDate() + 1);
      continue;
    }

    const dayLeaveBlocks = leaveBlocks.filter((leave) => {
      if (leave.status !== "approved") return false;
      const fromDate = new Date(leave.fromDate).toISOString().split("T")[0];
      const toDate = new Date(leave.toDate).toISOString().split("T")[0];
      return dateStr >= fromDate && dateStr <= toDate;
    });

    const timeSlots = generateTimeSlots(daySchedule, breaks, visitSettings);

    for (const slot of timeSlots) {
      const slotStartMinutes = parseTime(slot.startTime);
      const slotEndMinutes = parseTime(slot.endTime);

      let status: "available" | "lunch" | "leave" = "available";

      const activeBreaks = breaks.filter((b) => b.isEnabled);
      for (const brk of activeBreaks) {
        const brkStart = parseTime(brk.startTime);
        const brkEnd = parseTime(brk.endTime);
        if (
          (slotStartMinutes >= brkStart && slotStartMinutes < brkEnd) ||
          (slotEndMinutes > brkStart && slotEndMinutes <= brkEnd)
        ) {
          status = "lunch";
          break;
        }
      }

      if (status === "available") {
        for (const leave of dayLeaveBlocks) {
          if (leave.leaveType === "full_day") {
            status = "leave";
            break;
          }
          if (leave.leaveType === "custom_time" && leave.startTime && leave.endTime) {
            const leaveStart = parseTime(leave.startTime);
            const leaveEnd = parseTime(leave.endTime);
            if (
              (slotStartMinutes >= leaveStart && slotStartMinutes < leaveEnd) ||
              (slotEndMinutes > leaveStart && slotEndMinutes <= leaveEnd)
            ) {
              status = "leave";
              break;
            }
          }
        }
      }

      const existingSlot = existingSlots.find(
        (es) => es.slotDate === dateStr && es.startTime === slot.startTime
      );
      if (!existingSlot) {
        slots.push({
          doctorId,
          slotDate: new Date(current),
          startTime: slot.startTime,
          endTime: slot.endTime,
          status
        });
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return slots;
}

export function formatDoctorName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function getDayName(dayOfWeek: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayOfWeek];
}

export function getDayShortName(dayOfWeek: number): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[dayOfWeek];
}

export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  const dateStr = date.toISOString().split("T")[0];
  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];
  return dateStr >= startStr && dateStr <= endStr;
}

export function getWeekDates(startOfWeek: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startOfWeek);
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}
