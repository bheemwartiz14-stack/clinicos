"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/auth.service";
import { getProfilePageModel, getUsersPageModel, updateProfile } from "./users.service";

export async function usersPageController() {
  return getUsersPageModel();
}

export async function profilePageController(searchParams: Promise<{ updated?: string }>) {
  return getProfilePageModel(searchParams);
}

export async function updateProfileAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await updateProfile(user.id, formData);

  redirect("/dashboard/profile?updated=1");
}
