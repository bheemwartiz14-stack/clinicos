"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { z } from "zod";
import { requirePageSession } from "@/lib/auth";
import { clearSessionCookie } from "@modules/auth/services/session-cookie.service";
import { settingsService } from "../services/settings.service";

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().max(100).optional(),
  username: z.string().trim().min(3).max(100).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  avatar: z.string().trim().refine((value) => {
    if (!value) return true;
    if (value.startsWith("/uploads/images/")) return true;
    return z.string().url().safeParse(value).success;
  }, "Avatar must be an uploaded image or a valid URL").optional().or(z.literal(""))
});

const passwordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8)
}).refine((value) => value.newPassword === value.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export async function updateProfileAction(formData: FormData) {
  const session = await requirePageSession();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`/settings/profile?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid profile details")}` as Route);
  }

  await settingsService.updateProfile(session.userId, parsed.data);
  revalidatePath("/settings/profile");
  revalidatePath("/settings");
  redirect("/settings/profile?saved=profile" as Route);
}

export async function changePasswordAction(formData: FormData) {
  const session = await requirePageSession();
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`/settings/security?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid password details")}` as Route);
  }

  try {
    await settingsService.changePassword(session.userId, parsed.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to change password";
    redirect(`/settings/security?error=${encodeURIComponent(message)}` as Route);
  }

  await clearSessionCookie();
  redirect("/login?password=changed" as Route);
}
