import { desc, eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@mediclinic/auth";

import {
  db,
  roles,
  userSessions,
  users,
} from "@mediclinic/db";

export type ProfileSummary = {
  id: string;
  firstName: string;
  lastName: string | null;
  name: string;
  username: string | null;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  branchName: string | null;
};

export type SessionSummary = {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  isActive: boolean;
  isCurrent: boolean;
  expiresAt: Date;
  createdAt: Date;
};

function fullName(user: { firstName: string; lastName: string | null }) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ");
}

/**
 * GET ROLE (UPDATED: uses users.roleId)
 */
async function getRole(userId: string) {
  const [user] = await db
    .select({ roleId: users.roleId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user?.roleId) return "unassigned";
  const [role] = await db
    .select({ code: roles.code })
    .from(roles)
    .where(eq(roles.id, user.roleId))
    .limit(1);
  return role?.code ?? "unassigned";
}

export const settingsService = {
  /**
   * PROFILE
   */
  async getProfile(userId: string): Promise<ProfileSummary | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return null;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: fullName(user),
      username: user.username,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: await getRole(user.id),
      status: user.status,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      branchName: "Main Clinic",
    };
  },

  /**
   * OVERVIEW
   */
  async overview(userId: string, currentSessionId: string) {
    const profile = await this.getProfile(userId);

    if (!profile) {
      throw new Error("Profile not found");
    }

    const sessions = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.userId, userId))
      .orderBy(desc(userSessions.createdAt))
      .limit(10);

    const sessionSummaries: SessionSummary[] = sessions.map((s) => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      isActive: s.isActive,
      isCurrent: s.id === currentSessionId,
      expiresAt: s.expiresAt,
      createdAt: s.createdAt,
    }));

    return {
      profile,
      branches: [{ id: "main", name: "Main Clinic" }],
      departments: [],
      sessions: sessionSummaries,
      loginHistory: sessionSummaries,
    };
  },

  /**
   * UPDATE PROFILE
   */
  async updateProfile(
    userId: string,
    input: {
      firstName: string;
      lastName?: string | null;
      username?: string | null;
      phone?: string | null;
      avatar?: string | null;
    }
  ) {
    await db
      .update(users)
      .set({
        firstName: input.firstName.trim(),
        lastName: input.lastName?.trim() || null,
        username: input.username?.trim().toLowerCase() || null,
        phone: input.phone?.trim() || null,
        avatar: input.avatar?.trim() || null,
      })
      .where(eq(users.id, userId));
  },

  /**
   * CHANGE PASSWORD
   */
  async changePassword(
    userId: string,
    input: { currentPassword: string; newPassword: string }
  ) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) throw new Error("Profile not found");

    const matches = await verifyPassword(
      input.currentPassword,
      user.passwordHash
    );

    if (!matches) {
      throw new Error("Current password is incorrect");
    }

    await db
      .update(users)
      .set({
        passwordHash: await hashPassword(input.newPassword),
      })
      .where(eq(users.id, userId));

    /**
     * logout all sessions after password change
     */
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.userId, userId));
  },
};