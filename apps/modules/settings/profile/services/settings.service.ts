import { headers } from "next/headers";
import { hashPassword, verifyPassword } from "@mediclinic/auth";
import {
  accountUpdateSchema,
  notificationPreferenceSchema,
  passwordSchema,
  profileUpdateSchema,
  type AccountUpdateInput,
  type NotificationPreferenceInput,
  type PasswordInput,
  type ProfileUpdateInput
} from "../validations/profile.validation";
import * as repository from "../repositories/settings.repository";

function clientMetadataFromHeaders(headerStore: Headers) {
  return {
    ipAddress: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip") ?? undefined,
    userAgent: headerStore.get("user-agent") ?? undefined
  };
}

export const settingsService = {
  async overview(userId: string, sessionId: string) {
    const [profile, branches, departments, preferences, sessions, loginHistory] = await Promise.all([
      repository.getSettingsProfile(userId),
      repository.listBranchesForSettings(),
      repository.listDepartmentsForSettings(),
      repository.getNotificationPreferences(userId),
      repository.listSessions(userId, sessionId),
      repository.listLoginHistory(userId)
    ]);

    if (!profile) throw new Error("Profile not found.");
    return { profile, branches, departments, preferences, sessions, loginHistory };
  },

  async getProfile(userId: string) {
    const profile = await repository.getSettingsProfile(userId);
    if (!profile) throw new Error("Profile not found.");
    return profile;
  },

  async updateProfile(userId: string, input: ProfileUpdateInput) {
    const currentProfile = await repository.getSettingsProfile(userId);
    if (!currentProfile) throw new Error("Profile not found.");

    const payload = profileUpdateSchema.parse({
      ...input,
      branchId: currentProfile.role === "doctor" ? currentProfile.branchId : input.branchId,
      departmentId: currentProfile.role === "doctor" ? currentProfile.departmentId : input.departmentId
    });
    await repository.updateProfile(userId, payload);
  },

  async updateAccount(userId: string, input: AccountUpdateInput) {
    const payload = accountUpdateSchema.parse(input);
    await repository.updateAccount(userId, payload);
  },

  async updateNotificationPreferences(userId: string, input: NotificationPreferenceInput) {
    const payload = notificationPreferenceSchema.parse(input);
    await repository.updateNotificationPreferences(userId, payload);
  },

  async changePassword(userId: string, sessionId: string, input: PasswordInput) {
    const payload = passwordSchema.parse(input);
    const currentHash = await repository.getUserPasswordHash(userId);
    if (!currentHash) throw new Error("Profile not found.");

    const matches = await verifyPassword(payload.currentPassword, currentHash);
    if (!matches) throw new Error("Current password is incorrect.");

    const nextHash = await hashPassword(payload.newPassword);
    await repository.changePassword(userId, nextHash, sessionId, payload.logoutOtherDevices, clientMetadataFromHeaders(await headers()));
  },

  async revokeSession(userId: string, currentSessionId: string, sessionId: string) {
    if (sessionId === currentSessionId) throw new Error("Use logout to end your current session.");
    const revoked = await repository.revokeSession(userId, sessionId);
    if (!revoked) throw new Error("Session not found.");
  }
};
