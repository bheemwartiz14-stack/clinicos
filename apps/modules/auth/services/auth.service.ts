import { and, eq, gt, isNull, or } from "drizzle-orm";
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
  type SessionUser
} from "@mediclinic/auth";
import { db, loginHistory, passwordResetTokens, userSessions, users } from "@mediclinic/db";

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const RESET_TTL_MS = 30 * 60 * 1000;

export const authService = {
  async login(input: LoginInput, metadata?: { ipAddress?: string; userAgent?: string }): Promise<SessionUser> {
    const credentials = loginSchema.parse(input);
    const identifier = normalizeIdentifier(credentials.identifier);
    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, identifier), eq(users.username, identifier)))
      .limit(1);
    if (!user || !user.isActive) {
      throw new Error("Invalid email, username, or password");
    }

    const passwordMatches = await verifyPassword(credentials.password, user.passwordHash);
    if (!passwordMatches) {
      throw new Error("Invalid email, username, or password");
    }

    const tokenVersion = generateSecureToken(24);
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const deviceName = metadata?.userAgent?.includes("Mobile") ? "Mobile browser" : "Web browser";
    const [session] = await db
      .insert(userSessions)
      .values({
        userId: user.id,
        tokenVersion,
        expiresAt,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        deviceName
      })
      .returning({ id: userSessions.id });

    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
    await db.insert(loginHistory).values({
      userId: user.id,
      sessionId: session.id,
      status: "success",
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      deviceName
    });

    return {
      sessionId: session.id,
      userId: user.id,
      branchId: user.branchId,
      role: user.role,
      email: user.email,
      username: user.username,
      name: user.name
    };
  },

  async logout(sessionId: string): Promise<void> {
    await db.update(userSessions).set({ revokedAt: new Date() }).where(eq(userSessions.id, sessionId));
  },

  async requestPasswordReset(input: PasswordResetRequestInput): Promise<{ token?: string }> {
    const payload = passwordResetRequestSchema.parse(input);
    const identifier = normalizeIdentifier(payload.identifier);
    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, identifier), eq(users.username, identifier)))
      .limit(1);

    if (!user || !user.isActive) {
      return {};
    }

    const token = generateSecureToken(32);
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: await hashResetToken(token),
      expiresAt: new Date(Date.now() + RESET_TTL_MS)
    });

    return process.env.NODE_ENV === "production" ? {} : { token };
  },

  async resetPassword(input: PasswordResetInput): Promise<void> {
    const payload = passwordResetSchema.parse(input);
    const tokenHash = await hashResetToken(payload.token);
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt), gt(passwordResetTokens.expiresAt, new Date())))
      .limit(1);

    if (!resetToken) {
      throw new Error("Password reset link is invalid or expired");
    }

    await db.update(users).set({ passwordHash: await hashPassword(payload.password) }).where(eq(users.id, resetToken.userId));
    await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, resetToken.id));
    await db.update(userSessions).set({ revokedAt: new Date() }).where(and(eq(userSessions.userId, resetToken.userId), isNull(userSessions.revokedAt)));
  }
};
