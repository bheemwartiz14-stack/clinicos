"use server";

import {
  createPatientFromForm,
  deletePatientFromForm,
  getPatientsPageData,
  updatePatientFromForm,
} from "./patients.service";
import type { PatientsPageSearchParams } from "./patients.types";

export async function patientsPageController(searchParams: Promise<PatientsPageSearchParams>) {
  return getPatientsPageData(searchParams);
}

export async function createPatientAction(formData: FormData) {
  return createPatientFromForm(formData);
}

export async function updatePatientAction(formData: FormData) {
  return updatePatientFromForm(formData);
}

export async function deletePatientAction(formData: FormData) {
  return deletePatientFromForm(formData);
}
