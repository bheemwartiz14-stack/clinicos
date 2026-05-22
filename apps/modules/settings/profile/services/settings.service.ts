import { desc, eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@mediclinic/auth";
import { db, roles, userRoles, userSessions, users } from "@mediclinic/db";

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

export type NotificationPreference = {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
};

function fullName(user: { firstName: string; lastName: string | null }) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ");
}

async function getRole(userId: string) {
  const [role] = await db
    .select({ code: roles.code })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId))
    .limit(1);

  return role?.code ?? "unassigned";
}

export const settingsService = {
  async getProfile(userId: string): Promise<ProfileSummary | null> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
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
      branchName: "Main Clinic"
    };
  },

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

    const sessionSummaries = sessions.map((session) => ({
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      isActive: session.isActive,
      isCurrent: session.id === currentSessionId,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt
    }));

    return {
      profile,
      branches: [{ id: "main", name: "Main Clinic" }],
      departments: [],
      sessions: sessionSummaries,
      loginHistory: sessionSummaries,
      preferences: [
        {
          key: "appointments",
          label: "Appointment updates",
          description: "Notify me about booking, cancellation, and queue changes.",
          enabled: true
        },
        {
          key: "billing",
          label: "Billing alerts",
          description: "Send alerts for invoices, payment failures, and refunds.",
          enabled: profile.role === "admin" || profile.role === "accountant"
        },
        {
          key: "security",
          label: "Security notifications",
          description: "Notify me about password changes and new sessions.",
          enabled: true
        }
      ] satisfies NotificationPreference[]
    };
  },

  async updateProfile(userId: string, input: { firstName: string; lastName?: string | null; username?: string | null; phone?: string | null; avatar?: string | null }) {
    await db
      .update(users)
      .set({
        firstName: input.firstName.trim(),
        lastName: input.lastName?.trim() || null,
        username: input.username?.trim().toLowerCase() || null,
        phone: input.phone?.trim() || null,
        avatar: input.avatar?.trim() || null
      })
      .where(eq(users.id, userId));
  },

  async changePassword(userId: string, input: { currentPassword: string; newPassword: string }) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new Error("Profile not found");

    const matches = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!matches) throw new Error("Current password is incorrect");

    await db.update(users).set({ passwordHash: await hashPassword(input.newPassword) }).where(eq(users.id, userId));
    await db.update(userSessions).set({ isActive: false }).where(eq(userSessions.userId, userId));
  }
};
