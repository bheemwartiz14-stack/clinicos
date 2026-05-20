"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "../../../../web/lib/auth";
import { settingsService } from "../services/settings.service";
import { accountUpdateSchema, notificationPreferenceSchema, passwordSchema, profileUpdateSchema } from "../validations/profile.validation";

export type SettingsActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function value(formData: FormData, key: string) {
  const formValue = formData.get(key);
  return typeof formValue === "string" ? formValue : "";
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function failure(error: unknown, fallback: string): SettingsActionState {
  if (error instanceof z.ZodError) {
    return {
      ok: false,
      message: fallback,
      fieldErrors: error.flatten().fieldErrors
    };
  }

  return { ok: false, message: error instanceof Error ? error.message : fallback };
}

export async function updateProfileAction(_state: SettingsActionState | null, formData: FormData): Promise<SettingsActionState> {
  const session = await requireSession();

  try {
    await settingsService.updateProfile(
      session.userId,
      profileUpdateSchema.parse({
        name: value(formData, "name"),
        username: value(formData, "username"),
        email: value(formData, "email"),
        phone: value(formData, "phone"),
        avatar: value(formData, "avatar"),
        gender: value(formData, "gender"),
        dob: value(formData, "dob"),
        address: value(formData, "address"),
        city: value(formData, "city"),
        state: value(formData, "state"),
        zipCode: value(formData, "zipCode"),
        country: value(formData, "country"),
        emergencyContact: {
          name: value(formData, "emergencyContactName"),
          phone: value(formData, "emergencyContactPhone"),
          relationship: value(formData, "emergencyContactRelationship")
        },
        bio: value(formData, "bio"),
        branchId: value(formData, "branchId"),
        departmentId: value(formData, "departmentId") || null,
        specialty: value(formData, "specialty"),
        licenseNumber: value(formData, "licenseNumber"),
        experienceYears: value(formData, "experienceYears") || "0",
        consultationFee: value(formData, "consultationFee") || "0"
      })
    );
    revalidatePath("/settings");
    return { ok: true, message: "Profile updated." };
  } catch (error) {
    return failure(error, "Please fix the highlighted profile details.");
  }
}

export async function updateAccountAction(_state: SettingsActionState | null, formData: FormData): Promise<SettingsActionState> {
  const session = await requireSession();

  try {
    await settingsService.updateAccount(
      session.userId,
      accountUpdateSchema.parse({
        username: value(formData, "username"),
        email: value(formData, "email"),
        profileVisibility: value(formData, "profileVisibility") || "team"
      })
    );
    revalidatePath("/settings");
    return { ok: true, message: "Account settings updated." };
  } catch (error) {
    return failure(error, "Please fix the highlighted account settings.");
  }
}

export async function updateNotificationPreferencesAction(_state: SettingsActionState | null, formData: FormData): Promise<SettingsActionState> {
  const session = await requireSession();

  try {
    await settingsService.updateNotificationPreferences(
      session.userId,
      notificationPreferenceSchema.parse({
        emailNotifications: checked(formData, "emailNotifications"),
        smsNotifications: checked(formData, "smsNotifications"),
        whatsappNotifications: checked(formData, "whatsappNotifications"),
        appointmentAlerts: checked(formData, "appointmentAlerts"),
        billingAlerts: checked(formData, "billingAlerts"),
        systemAlerts: checked(formData, "systemAlerts"),
        quietHoursStart: value(formData, "quietHoursStart"),
        quietHoursEnd: value(formData, "quietHoursEnd")
      })
    );
    revalidatePath("/settings");
    return { ok: true, message: "Notification preferences saved." };
  } catch (error) {
    return failure(error, "Please fix notification preferences.");
  }
}

export async function changePasswordAction(_state: SettingsActionState | null, formData: FormData): Promise<SettingsActionState> {
  const session = await requireSession();

  try {
    await settingsService.changePassword(
      session.userId,
      session.sessionId,
      passwordSchema.parse({
        currentPassword: value(formData, "currentPassword"),
        newPassword: value(formData, "newPassword"),
        confirmPassword: value(formData, "confirmPassword"),
        logoutOtherDevices: checked(formData, "logoutOtherDevices")
      })
    );
    revalidatePath("/settings");
    return { ok: true, message: "Password updated securely." };
  } catch (error) {
    return failure(error, "Please fix the highlighted password fields.");
  }
}

export async function revokeSessionAction(formData: FormData): Promise<SettingsActionState> {
  const session = await requireSession();

  try {
    await settingsService.revokeSession(session.userId, session.sessionId, value(formData, "sessionId"));
    revalidatePath("/settings");
    return { ok: true, message: "Session revoked." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to revoke session." };
  }
}
