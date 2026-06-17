import type { AppointmentJoinRow, AppointmentRecord } from "../types/appointment.types";

export function toAppointmentRecord(row: AppointmentJoinRow): AppointmentRecord {
  return {
    id: row.appointment.id,
    patientId: row.appointment.patientId,
    patientName: row.patient.fullName,
    patientPhone: row.patient.phone,
    doctorId: row.appointment.doctorId,
    doctorName: [row.user.firstName, row.user.lastName].filter(Boolean).join(" "),
    doctorSpecialty: row.specialty?.name ?? null,
    slotId: row.appointment.slotId,
    appointmentDate: row.appointment.appointmentDate,
    startTime: row.appointment.startTime,
    endTime: row.appointment.endTime,
    type: row.appointment.type,
    status: row.appointment.status,
    reason: row.appointment.reason,
    notes: row.appointment.notes,
    queueTokenNumber: row.appointment.queueTokenNumber,
    createdById: row.appointment.createdById,
  };
}

export function generateRecurringDates(
  startDate: string,
  endDate: string,
  pattern: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly"
): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  switch (pattern) {
    case "daily": {
      let d = new Date(start);
      while (d <= end) { dates.push(d.toISOString().split("T")[0]); d.setDate(d.getDate() + 1); }
      break;
    }
    case "weekly": {
      let d = new Date(start);
      while (d <= end) { dates.push(d.toISOString().split("T")[0]); d.setDate(d.getDate() + 7); }
      break;
    }
    case "biweekly": {
      let d = new Date(start);
      while (d <= end) { dates.push(d.toISOString().split("T")[0]); d.setDate(d.getDate() + 14); }
      break;
    }
    case "monthly": {
      let d = new Date(start);
      while (d <= end) { dates.push(d.toISOString().split("T")[0]); d.setMonth(d.getMonth() + 1); }
      break;
    }
    case "quarterly": {
      let d = new Date(start);
      while (d <= end) { dates.push(d.toISOString().split("T")[0]); d.setMonth(d.getMonth() + 3); }
      break;
    }
  }

  return dates;
}
