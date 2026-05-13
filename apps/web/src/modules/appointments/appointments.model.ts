import type { AppointmentsPageModel } from "./appointments.types";

export function getAppointmentsPageModel(
  model: Omit<AppointmentsPageModel, "breadcrumb" | "description" | "title">,
): AppointmentsPageModel {
  return {
    ...model,
    breadcrumb: ["Appointment Module", "Smart Scheduling"],
    description:
      "Manage doctor slots, appointment status, queue tokens, reminders, recurring visits, and online consultation links.",
    title: "Appointments",
  };
}
