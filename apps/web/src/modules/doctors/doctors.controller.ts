"use server";

import { createDoctorFromForm, getAddDoctorPageData, getDoctorsPageData } from "./doctors.service";
import type { DoctorsPageSearchParams } from "./doctors.types";

export async function doctorsPageController(searchParams: Promise<DoctorsPageSearchParams>) {
  return getDoctorsPageData(searchParams);
}

export async function addDoctorPageController() {
  return getAddDoctorPageData();
}

export async function createDoctorAction(formData: FormData) {
  return createDoctorFromForm(formData);
}
