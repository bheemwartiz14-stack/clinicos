"use client";

import { useQuery } from "@tanstack/react-query";
import type { GeneralSettingsPageModel } from "../genral-setting.types";

async function fetchGeneralSettings(): Promise<GeneralSettingsPageModel> {
  const response = await fetch("/api/setting/system/genral-setting", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch general settings");
  }

  return (await response.json()) as GeneralSettingsPageModel;
}

export function useGeneralSettings() {
  return useQuery({
    queryKey: ["general-settings"],
    queryFn: fetchGeneralSettings,
  });
}
