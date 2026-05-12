"use server";

import {
  createUserFromForm,
  deleteUserFromForm,
  getUsersPageData,
  updateUserFromForm,
} from "./users.service";
import  { UsersPageSearchParams } from "./users.types";

export async function usersPageController(searchParams: Promise<UsersPageSearchParams>) {
  return getUsersPageData(searchParams);
}

export async function createUserAction(formData: FormData) {
  return createUserFromForm(formData);
}

export async function updateUserAction(formData: FormData) {
  return updateUserFromForm(formData);
}

export async function deleteUserAction(formData: FormData) {
  return deleteUserFromForm(formData);
}
