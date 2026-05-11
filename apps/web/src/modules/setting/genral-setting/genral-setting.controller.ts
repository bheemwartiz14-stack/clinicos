"use server";

import {
  getGeneralSettingsData,
  getGeneralSettingsPageData,
  updateGeneralSettingsFromForm,
} from "./genral-setting.service";

export async function generalSettingsPageController() {
  return getGeneralSettingsPageData();
}

export async function generalSettingsController() {
  return getGeneralSettingsData();
}

export async function updateGeneralSettingsAction(formData: FormData) {
  return updateGeneralSettingsFromForm(formData);
}
