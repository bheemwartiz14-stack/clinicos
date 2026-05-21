import * as doctorRepo from "../repositories/doctor.repository";
import type {
  DoctorCalendarConnection,
  DoctorCalendarBusyEvent,
  CalendarSyncType,
  CalendarProvider,
} from "../types/doctor.types";

export const doctorCalendarService = {
  async getConnection(
    doctorId: string,
  ): Promise<DoctorCalendarConnection | null> {
    return doctorRepo.getDoctorCalendarConnection(doctorId);
  },

  async createConnection(data: {
    doctorId: string;
    userId: string;
    provider: CalendarProvider;
    providerAccountEmail: string;
    accessToken: string;
    refreshToken?: string;
    tokenType?: string;
    scope?: string;
    expiryDate: Date;
    calendarId?: string;
  }): Promise<DoctorCalendarConnection> {
    const existing = await doctorRepo.getDoctorCalendarConnection(data.doctorId);

    if (existing) {
      const refreshToken: string | undefined = data.refreshToken ?? undefined;
      const existingRefreshToken: string | undefined = existing.refreshToken ?? undefined;
      return doctorRepo.updateCalendarConnection(existing.id, {
        provider: data.provider,
        providerAccountEmail: data.providerAccountEmail,
        accessToken: data.accessToken,
        refreshToken: refreshToken ?? existingRefreshToken,
        tokenType: data.tokenType ?? existing.tokenType ?? "Bearer",
        scope: data.scope ?? existing.scope ?? "",
        expiryDate: data.expiryDate,
        calendarId: data.calendarId ?? existing.calendarId ?? "primary",
        isConnected: true,
        syncStatus: "connected",
        syncError: null,
      });
    }

    return doctorRepo.createCalendarConnection({
      doctorId: data.doctorId,
      userId: data.userId,
      provider: data.provider,
      providerAccountEmail: data.providerAccountEmail,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? "",
      tokenType: data.tokenType ?? "Bearer",
      scope: data.scope ?? "",
      expiryDate: data.expiryDate,
      calendarId: data.calendarId ?? "",
      isConnected: true,
      syncStatus: "connected",
      syncError: null,
    });
  },

  async updateTokens(
    id: string,
    tokens: {
      accessToken: string;
      refreshToken?: string;
      expiryDate: Date;
    },
  ): Promise<DoctorCalendarConnection> {
    return doctorRepo.updateCalendarConnection(id, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiryDate: tokens.expiryDate,
      syncStatus: "connected",
      syncError: null,
    });
  },

  async disconnect(doctorId: string): Promise<{ success: true } | null> {
    const connection = await doctorRepo.getDoctorCalendarConnection(doctorId);
    if (!connection) return null;

    await doctorRepo.deleteCalendarBusyEvents(connection.id);
    await doctorRepo.deleteCalendarConnection(doctorId);

    return { success: true };
  },

  async getBusyEvents(
    doctorId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DoctorCalendarBusyEvent[]> {
    return doctorRepo.getCalendarBusyEvents(doctorId, startDate, endDate);
  },

  async syncBusyEvents(
    doctorId: string,
    events: Array<{
      providerEventId: string;
      calendarId: string;
      title: string | null;
      startAt: Date;
      endAt: Date;
      isAllDay: boolean;
    }>,
  ): Promise<void> {
    const connection = await doctorRepo.getDoctorCalendarConnection(doctorId);

    if (!connection) {
      throw new Error("No calendar connection found");
    }

    await doctorRepo.deleteCalendarBusyEvents(connection.id);

    if (events.length > 0) {
      await doctorRepo.createCalendarBusyEvents(
        events.map((event) => ({
          doctorId,
          connectionId: connection.id,
          providerEventId: event.providerEventId,
          calendarId: event.calendarId,
          title: event.title,
          startAt: event.startAt,
          endAt: event.endAt,
          isAllDay: event.isAllDay,
          status: "busy",
        })),
      );
      await doctorRepo.markSlotsCalendarBusy(doctorId, events);
    }

    await doctorRepo.updateCalendarConnection(connection.id, {
      lastSyncedAt: new Date(),
      syncStatus: "connected",
      syncError: null,
    });
  },

  async recordSyncStart(
    doctorId: string,
    connectionId: string,
    syncType: CalendarSyncType,
  ) {
    return doctorRepo.createCalendarSyncLog({
      doctorId,
      connectionId,
      syncType,
      status: "failed",
      startedAt: new Date(),
    });
  },

  async recordSyncComplete(
    logId: string,
    status: "success" | "failed",
    message?: string,
  ) {
    return doctorRepo.updateCalendarSyncLog(logId, {
      status,
      message: message ?? null,
      completedAt: new Date(),
    });
  },

  async getLastSyncStatus(doctorId: string) {
    const connection = await doctorRepo.getDoctorCalendarConnection(doctorId);
    if (!connection) return null;

    return {
      isConnected: connection.isConnected,
      syncStatus: connection.syncStatus,
      lastSyncedAt: connection.lastSyncedAt,
      syncError: connection.syncError,
      provider: connection.provider,
      email: connection.providerAccountEmail,
      calendarId: connection.calendarId ?? "primary",
    };
  },

  async isTokenExpired(
    connection: DoctorCalendarConnection,
  ): Promise<boolean> {
    if (!connection.expiryDate) return true;

    return new Date(connection.expiryDate) <= new Date();
  },
};
