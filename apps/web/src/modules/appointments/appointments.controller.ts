"use server";

import { createAppointmentFromForm, getAppointmentsPageData } from "./appointments.service";
import type { AppointmentsPageSearchParams } from "./appointments.types";

export async function appointmentsPageController(
  searchParams: Promise<AppointmentsPageSearchParams>,
) {
  return getAppointmentsPageData(searchParams);
}

export async function createAppointmentAction(formData: FormData) {
  return createAppointmentFromForm(formData);
}
