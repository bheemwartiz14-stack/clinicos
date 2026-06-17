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
    const encryptedRefreshToken = data.refreshToken ? encryptToken(data.refreshToken) : null;
    return db
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
  },

  async getByUserId(
  userId: string
): Promise<GoogleCalendarConnection | undefined> {
  const connection = await db.query.googleCalendarConnections.findFirst({
    where: eq(googleCalendarConnections.userId, userId),
  });

  if (!connection) return undefined;

  return {
    ...connection,
    createdAt: connection.createdAt ?? new Date(),
    updatedAt: connection.updatedAt ?? new Date(),
    refreshToken: connection.refreshToken
      ? decryptToken(connection.refreshToken)
      : null,
  };
},

  async updateTokens(userId: string, accessToken: string, refreshToken: string | null, expiryDate: Date | null) {
    const encryptedRefreshToken = refreshToken ? encryptToken(refreshToken) : null;
    return db
      .update(googleCalendarConnections)
      .set({
        accessToken,
        refreshToken: encryptedRefreshToken,
        expiryDate,
        updatedAt: new Date(),
      })
      .where(eq(googleCalendarConnections.userId, userId));
  },

  async updateCalendarId(userId: string, calendarId: string) {
    return db
      .update(googleCalendarConnections)
      .set({ calendarId, updatedAt: new Date() })
      .where(eq(googleCalendarConnections.userId, userId));
  },

  async disconnect(userId: string) {
    return db
      .update(googleCalendarConnections)
      .set({
        isConnected: false,
        accessToken: null,
        refreshToken: null,
        expiryDate: null,
        updatedAt: new Date(),
      })
      .where(eq(googleCalendarConnections.userId, userId));
  },

  async delete(userId: string) {
    return db
      .delete(googleCalendarConnections)
      .where(eq(googleCalendarConnections.userId, userId));
  },
};
