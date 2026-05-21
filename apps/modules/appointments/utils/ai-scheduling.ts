import type { AppointmentPriority, AppointmentRecord, SlotSuggestion } from "../types/appointment.types";

export function predictNoShowRisk(input: { appointmentTime: Date; priority: AppointmentPriority; previousNoShows?: number; isRescheduled?: boolean }) {
  const hour = input.appointmentTime.getHours();
  let score = 0.12;
  if (hour < 9 || hour > 16) score += 0.08;
  if (input.priority !== "routine") score += 0.06;
  if (input.isRescheduled) score += 0.1;
  score += Math.min(0.45, (input.previousNoShows ?? 0) * 0.15);
  const bounded = Math.min(0.95, Math.max(0.02, score));
  return {
    score: bounded,
    level: bounded >= 0.6 ? "high" : bounded >= 0.32 ? "medium" : "low",
    recommendedReminderFrequency: bounded >= 0.6 ? "email_sms_whatsapp_24h_2h" : bounded >= 0.32 ? "email_sms_24h_4h" : "email_24h"
  };
}

export function recommendSlots(slots: SlotSuggestion[], appointments: AppointmentRecord[]) {
  const workloadByDoctor = appointments.reduce<Record<string, number>>((acc, appointment) => {
    acc[appointment.doctorId] = (acc[appointment.doctorId] ?? 0) + 1;
    return acc;
  }, {});

  return slots
    .filter((slot) => slot.status === "available")
    .map((slot) => ({
      ...slot,
      score: Math.max(0, slot.score - (workloadByDoctor[slot.doctorId] ?? 0) * 0.04)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

export function optimizeReminderTimes(startsAt: Date, riskScore: number) {
  const leadHours = riskScore >= 0.6 ? [48, 24, 2] : riskScore >= 0.32 ? [24, 4] : [24];
  return leadHours.map((hours) => new Date(startsAt.getTime() - hours * 60 * 60 * 1000));
}
