"use server";

import { createRoleFromForm, getRolesPermissionsPageData } from "./roles-permissions.service";

export async function rolesPermissionsPageController() {
  return getRolesPermissionsPageData();
}

export async function createRoleAction(formData: FormData) {
  return createRoleFromForm(formData);
}
