import { and, eq, gt, or } from "drizzle-orm";

import {
  generateSecureToken,
  hashPassword,
  hashResetToken,
  loginSchema,
  normalizeIdentifier,
  passwordResetRequestSchema,
  passwordResetSchema,
  verifyPassword,
  type LoginInput,
  type PasswordResetInput,
  type PasswordResetRequestInput,
  type SessionUser,
} from "@mediclinic/auth";

import {
  db,
  passwordResetTokens,
  roles,
  userSessions,
  users,
} from "@mediclinic/db";
import { loginHistoryService } from "./login-history.service";
import {
  sendNotification,
  sendSystemNotification,
} from "../../settings/notifications/services/notification-sender.service";
import { auditService } from "@modules/doctors/services/audit.service";

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const RESET_TTL_MS = 30 * 60 * 1000;

const roleCache = new Map<string, any>();
async function getRoleById(roleId: string) {
  if (roleCache.has(roleId)) return roleCache.get(roleId);
  const role = await db.query.roles.findFirst({
    where: eq(roles.id, roleId),
  });
  if (role) roleCache.set(roleId, role);
  return role;
}

export const authService = {
  async login(
    input: LoginInput,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<SessionUser> {
    const credentials = loginSchema.parse(input);
    const identifier = normalizeIdentifier(credentials.identifier);

    const [user] = await db .select() .from(users)  .where(
        or(
          eq(users.email, identifier),
          eq(users.username, identifier)
        )
      )
      .limit(1);
    if (!user || user.status !== "active") {
      await loginHistoryService.log({
        status: "failed",
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        failureReason: "User not found or inactive",
      }).catch(() => { });

      throw new Error("Invalid email, username, or password");
    }

    const passwordMatches = await verifyPassword(
      credentials.password,
      user.passwordHash
    );

    if (!passwordMatches) {
      await loginHistoryService.log({
        userId: user.id,
        status: "failed",
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        failureReason: "Invalid password",
      }).catch(() => { });

      sendSystemNotification({
        userId: user.id,
        type: "warning",
        subject: "Failed Login Attempt",
        body: "Incorrect password login attempt detected.",
        link: "/settings/profile",
      }).catch(() => { });

      throw new Error("Invalid email, username, or password");
    }

    /**
     * ROLE FETCH (NOW FROM users.roleId, NOT userRoles)
     */
    const role = await getRoleById(user.roleId);

    if (!role) {
      await loginHistoryService.log({
        userId: user.id,
        status: "failed",
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        failureReason: "Role not found",
      }).catch(() => { });

      throw new Error("Account role configuration missing");
    }

    /**
     * SESSION CREATION
     */
    const sessionSecret = generateSecureToken(24);
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    const [session] = await db
      .insert(userSessions)
      .values({
        userId: user.id,
        tokenHash: sessionSecret,
        expiresAt,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      })
      .returning({ id: userSessions.id });

    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    /**
     * LOGS + AUDIT (non-blocking)
     */
    loginHistoryService.log({
      userId: user.id,
      status: "success",
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    }).catch(() => { });

    auditService.log({
      userId: user.id,
      action: "login",
      entity: "session",
      entityId: session.id,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    }).catch(() => { });

    const userName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ");

    const now = new Date().toLocaleString();
    const deviceInfo = metadata?.userAgent ?? "Unknown device";

    sendSystemNotification({
      userId: user.id,
      type: "info",
      subject: "New Login Detected",
      body: `Login from ${deviceInfo} on ${now}`,
      link: "/settings/profile",
    }).catch(() => { });

    sendNotification({
      templateCode: "auth_login_success_email",
      recipient: user.email,
      variables: {
        clinic_name: "ClinicOS",
        user_name: userName,
        login_time: now,
        device_info: deviceInfo,
        ip_address: metadata?.ipAddress ?? "Unknown",
        portal_url: process.env.NEXT_PUBLIC_APP_URL ?? "",
      },
      userId: user.id,
    }).catch(() => { });

    return {
      sessionId: session.id,
      userId: user.id,
      role: role.code as SessionUser["role"],
      email: user.email,
      username: user.username,
      name: userName,
    };
  },

  /**
   * LOGOUT
   */
  async logout(
    sessionId: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    const [session] = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.id, sessionId))
      .limit(1)
      .catch(() => []);

    if (session) {
      loginHistoryService.log({
        userId: session.userId,
        status: "success",
        ipAddress: metadata?.ipAddress ?? session.ipAddress ?? undefined,
        userAgent: metadata?.userAgent ?? session.userAgent ?? undefined,
      }).catch(() => { });
    }

    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.id, sessionId));

    auditService.log({
      action: "logout",
      entity: "session",
      entityId: sessionId,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    }).catch(() => { });
  },

  /**
   * REQUEST PASSWORD RESET
   */
  async requestPasswordReset(
    input: PasswordResetRequestInput
  ): Promise<{ token?: string }> {
    const payload = passwordResetRequestSchema.parse(input);
    const identifier = normalizeIdentifier(payload.identifier);

    const [user] = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, identifier),
          eq(users.username, identifier)
        )
      )
      .limit(1);

    if (!user || user.status !== "active") return {};

    const token = generateSecureToken(32);

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: await hashResetToken(token),
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    const userName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ");

    sendNotification({
      templateCode: "auth_password_reset_request",
      recipient: user.email,
      variables: {
        clinic_name: "ClinicOS",
        user_name: userName,
        reset_link: resetLink,
        portal_url: appUrl,
      },
      userId: user.id,
    }).catch(() => { });

    return process.env.NODE_ENV === "production" ? {} : { token };
  },

  /**
   * RESET PASSWORD
   */
  async resetPassword(input: PasswordResetInput): Promise<void> {
    const payload = passwordResetSchema.parse(input);

    const tokenHash = await hashResetToken(payload.token);

    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          eq(passwordResetTokens.isUsed, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!resetToken) {
      throw new Error("Password reset link is invalid or expired");
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        passwordHash: await hashPassword(payload.password),
      })
      .where(eq(users.id, resetToken.userId))
      .returning();

    await db
      .update(passwordResetTokens)
      .set({ isUsed: true })
      .where(eq(passwordResetTokens.id, resetToken.id));

    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.userId, resetToken.userId));

    if (updatedUser) {
      const userName = [updatedUser.firstName, updatedUser.lastName]
        .filter(Boolean)
        .join(" ");

      sendSystemNotification({
        userId: resetToken.userId,
        type: "success",
        subject: "Password Changed",
        body: "All sessions terminated after password update.",
        link: "/settings/profile",
      }).catch(() => { });

      sendNotification({
        templateCode: "auth_password_reset_success_email",
        recipient: updatedUser.email,
        variables: {
          clinic_name: "ClinicOS",
          user_name: userName,
          reset_time: new Date().toLocaleString(),
          portal_url: process.env.NEXT_PUBLIC_APP_URL ?? "",
        },
        userId: resetToken.userId,
      }).catch(() => { });
    }
  },
};