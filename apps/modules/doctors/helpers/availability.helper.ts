import type { DoctorDetails } from "../types/doctor.types";

export function getDoctorAvailabilityLabel(doctor: Pick<DoctorDetails, "isActive" | "isAvailable" | "schedules">) {
  if (!doctor.isActive) return { label: "Inactive", tone: "secondary" as const };
  if (!doctor.isAvailable) return { label: "Unavailable", tone: "destructive" as const };
  if (!doctor.schedules.some((schedule) => schedule.isActive)) return { label: "No schedule", tone: "outline" as const };
  return { label: "Available", tone: "default" as const };
}
