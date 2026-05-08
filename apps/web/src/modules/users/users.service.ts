import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/auth.service";
import { findUsers, updateUserProfile } from "./users.model";
import { updateUserProfileSchema } from "./users.validation";

export async function getUsersPageModel() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  return {
    currentUser: user,
    users: await findUsers(),
  };
}

export async function getProfilePageModel(searchParams: Promise<{ updated?: string }>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { updated } = await searchParams;

  return {
    user,
    updated: updated === "1",
  };
}

export async function updateProfile(userId: string, formData: FormData) {
  const input = updateUserProfileSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  await updateUserProfile(userId, input);
}
