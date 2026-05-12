"use server";

import {
  createDepartmentFromForm,
  deleteDepartmentFromForm,
  getDepartmentsPageData,
  updateDepartmentFromForm,
} from "./departments.service";
import type { DepartmentsPageSearchParams } from "./departments.types";

export async function departmentsPageController(
  searchParams: Promise<DepartmentsPageSearchParams>,
) {
  return getDepartmentsPageData(searchParams);
}

export async function createDepartmentAction(formData: FormData) {
  return createDepartmentFromForm(formData);
}

export async function updateDepartmentAction(formData: FormData) {
  return updateDepartmentFromForm(formData);
}

export async function deleteDepartmentAction(formData: FormData) {
  return deleteDepartmentFromForm(formData);
}
