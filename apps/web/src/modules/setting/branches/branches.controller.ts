"use server";

import {
  createBranchFromForm,
  deleteBranchFromForm,
  getBranchesPageData,
  updateBranchFromForm,
} from "./branches.service";
import type { BranchesPageSearchParams } from "./branches.types";

export async function branchesPageController(searchParams: Promise<BranchesPageSearchParams>) {
  return getBranchesPageData(searchParams);
}

export async function createBranchAction(formData: FormData) {
  return createBranchFromForm(formData);
}

export async function updateBranchAction(formData: FormData) {
  return updateBranchFromForm(formData);
}

export async function deleteBranchAction(formData: FormData) {
  return deleteBranchFromForm(formData);
}
