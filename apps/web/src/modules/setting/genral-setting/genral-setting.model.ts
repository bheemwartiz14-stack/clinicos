import type { GeneralSettings, GeneralSettingsPageModel } from "./genral-setting.types";

export function getGeneralSettingsPageModel(
  settings: GeneralSettings | null,
): GeneralSettingsPageModel {
  return {
    title: "System Settings",
    description: "Manage clinic identity, support contacts, social links, and brand assets.",
    breadcrumb: ["Workspace", "System & Admin", "System Settings"],
    settings,
  };
}
