import { db, googleCalendarConnections } from "@mediclinic/db";
import { eq } from "drizzle-orm";
import { encryptToken, decryptToken } from "./utils/encryption";
import type { GoogleCalendarConnection } from "./google-calendar.type";

type UpsertInput = {
  userId: string;
  accessToken: string;
  refreshToken?: string | null;
  expiryDate?: Date | null;
  scope?: string | null;
  calendarId?: string | null;
};

export const GoogleCalendarRepository = {
  async upsertConnection(data: UpsertInput) {
    try {
      if (!data.userId) throw new Error("userId required");

      const encryptedRefreshToken = data.refreshToken
        ? encryptToken(data.refreshToken)
        : null;

      return await db
        .insert(googleCalendarConnections)
        .values({
          userId: data.userId,
          accessToken: data.accessToken,
          refreshToken: encryptedRefreshToken,
          expiryDate: data.expiryDate ?? null,
          scope: data.scope ?? null,
          calendarId: data.calendarId ?? null,
          isConnected: true,
        })
        .onConflictDoUpdate({
          target: googleCalendarConnections.userId,
          set: {
            accessToken: data.accessToken,
            refreshToken: encryptedRefreshToken,
            expiryDate: data.expiryDate ?? null,
            scope: data.scope ?? null,
            calendarId: data.calendarId ?? null,
            isConnected: true,
            updatedAt: new Date(),
          },
        });
    } catch (err) {
      console.error("❌ upsertConnection FAILED:", err);
      throw err;
    }
  },

  async getByUserId(
    userId: string
  ): Promise<GoogleCalendarConnection | undefined> {
    try {
      if (!userId) throw new Error("userId required");

      const connection =
        await db
          .select()
          .from(googleCalendarConnections)
          .where(eq(googleCalendarConnections.userId, userId))
          .limit(1)
          .then((r) => r[0]);

      if (!connection) return undefined;

      return {
        ...connection,
        createdAt: connection.createdAt ?? new Date(),
        updatedAt: connection.updatedAt ?? new Date(),
        refreshToken: connection.refreshToken
          ? decryptToken(connection.refreshToken)
          : null,
      };
    } catch (err) {
      console.error("❌ getByUserId FAILED:", err);
      return undefined;
    }
  },

  async updateTokens(
    userId: string,
    accessToken: string,
    refreshToken: string | null,
    expiryDate: Date | null
  ) {
    try {
      const encryptedRefreshToken = refreshToken
        ? encryptToken(refreshToken)
        : null;

      return await db
        .update(googleCalendarConnections)
        .set({
          accessToken,
          refreshToken: encryptedRefreshToken,
          expiryDate,
          updatedAt: new Date(),
        })
        .where(eq(googleCalendarConnections.userId, userId));
    } catch (err) {
      console.error("❌ updateTokens FAILED:", err);
      throw err;
    }
  },

  async updateCalendarId(userId: string, calendarId: string) {
    try {
      return await db
        .update(googleCalendarConnections)
        .set({
          calendarId,
          updatedAt: new Date(),
        })
        .where(eq(googleCalendarConnections.userId, userId));
    } catch (err) {
      console.error("❌ updateCalendarId FAILED:", err);
      throw err;
    }
  },

  async disconnect(userId: string) {
    try {
      return await db
        .update(googleCalendarConnections)
        .set({
          isConnected: false,
          accessToken: null,
          refreshToken: null,
          expiryDate: null,
          updatedAt: new Date(),
        })
        .where(eq(googleCalendarConnections.userId, userId));
    } catch (err) {
      console.error("❌ disconnect FAILED:", err);
      throw err;
    }
  },

  async delete(userId: string) {
    try {
      return await db
        .delete(googleCalendarConnections)
        .where(eq(googleCalendarConnections.userId, userId));
    } catch (err) {
      console.error("❌ delete FAILED:", err);
      throw err;
    }
  },
};