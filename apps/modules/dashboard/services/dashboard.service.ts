import { getDashboardRawData } from "../repositories/dashboard.repository";
import type { DashboardData, DashboardMetric } from "../types/dashboard.types";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfNextDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfNextMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function startOfPreviousMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 0, style: "currency" }).format(value);
}

function trend(current: number, previous: number) {
  if (previous === 0 && current === 0) return "0%";
  if (previous === 0) return "+100%";

  const value = ((current - previous) / previous) * 100;
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

function metric(label: string, value: string, current: number, previous: number): DashboardMetric {
  const change = trend(current, previous);
  return {
    label,
    value,
    change,
    detail: "this month",
    tone: change.startsWith("-") ? "warning" : "success"
  };
}

function statusLabel(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const dashboardService = {
  async getDashboardData(branchId: string, now = new Date()): Promise<DashboardData> {
    const raw = await getDashboardRawData(branchId, {
      today: { start: startOfDay(now), end: startOfNextDay(now) },
      month: { start: startOfMonth(now), end: startOfNextMonth(now) },
      previousMonth: { start: startOfPreviousMonth(now), end: startOfMonth(now) }
    });

    const metrics: DashboardMetric[] = [
      metric("Total Patients", formatNumber(raw.totalPatients), raw.currentMonthPatients, raw.previousMonthPatients),
      metric("Today Appointments", formatNumber(raw.todayAppointments), raw.currentMonthAppointments, raw.previousMonthAppointments),
      metric("Revenue", formatCurrency(raw.currentMonthRevenue), raw.currentMonthRevenue, raw.previousMonthRevenue),
      metric("AI Notes", formatNumber(raw.currentMonthAiNotes), raw.currentMonthAiNotes, raw.previousMonthAiNotes)
    ];

    return {
      metrics,
      appointments: raw.upcomingAppointments.map((appointment) => ({
        id: appointment.id,
        patient: `${appointment.patientFirstName} ${appointment.patientLastName}`,
        doctor: `Dr. ${appointment.doctorFirstName} ${appointment.doctorLastName}`,
        time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(appointment.startsAt),
        status: statusLabel(appointment.status)
      })),
      aiSummary: [
        `${raw.currentMonthPatientNotes} clinical notes were added this month.`,
        `${raw.pendingConfirmations} appointments are scheduled for today.`,
        `${raw.currentMonthAiNotes} appointments include AI intake summaries this month.`
      ],
      pendingConfirmations: raw.pendingConfirmations
    };
  }
};
