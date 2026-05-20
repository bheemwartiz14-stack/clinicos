import { getDoctorIntegration, updateDoctorIntegration } from "../repositories/integration.repository";
import { listIntegrationBusyEvents, markSlotsCalendarBusy, replaceIntegrationBusyEvents } from "../repositories/google-calendar.repository";
import { ensureAccessToken, fetchGoogleBusyEvents } from "../utils/calendar-busy-sync";
import { syncGoogleCalendarSchema, type SyncGoogleCalendarInput } from "../schemas/google-calendar.schema";

export const googleCalendarService = {
  async sync(doctorId: string, input: SyncGoogleCalendarInput = { daysAhead: 30 }) {
    const parsed = syncGoogleCalendarSchema.parse(input);
    const integration = await getDoctorIntegration(doctorId, "google_calendar");
    if (!integration || integration.status !== "connected" || !integration.isEnabled) {
      throw new Error("Google Calendar is not connected for this doctor.");
    }

    try {
      const accessToken = await ensureAccessToken(integration, async (data) => {
        await updateDoctorIntegration(integration.id, {
          accessToken: data.accessToken,
          expiryDate: data.expiryDate,
          tokenType: data.tokenType,
          scope: data.scope
        });
      });

      const timeMin = new Date();
      const timeMax = new Date(timeMin.getTime() + parsed.daysAhead * 24 * 60 * 60 * 1000);
      const events = await fetchGoogleBusyEvents({
        accessToken,
        calendarId: integration.calendarId,
        timeMin,
        timeMax
      });

      await replaceIntegrationBusyEvents({ doctorId, integrationId: integration.id, events });
      await markSlotsCalendarBusy(doctorId, events);
      await updateDoctorIntegration(integration.id, {
        status: "connected",
        lastSyncedAt: new Date(),
        errorMessage: null
      });

      return { eventsCount: events.length };
    } catch (error) {
      await updateDoctorIntegration(integration.id, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Google Calendar sync failed."
      });
      throw error;
    }
  },

  busyEvents(doctorId: string, startAt: Date, endAt: Date) {
    return listIntegrationBusyEvents(doctorId, startAt, endAt);
  }
};
