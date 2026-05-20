import { getDoctorIntegration, updateDoctorIntegration } from "../repositories/integration.repository";
import { attachMeetingToAppointment, createDoctorMeetEvent } from "../repositories/google-meet.repository";
import { createGoogleMeetLinkSchema, saveGoogleMeetSettingsSchema, type CreateGoogleMeetLinkInput, type SaveGoogleMeetSettingsInput } from "../schemas/google-meet.schema";
import { createGoogleMeetCalendarEvent } from "../utils/google-meet-link";

export const googleMeetService = {
  async saveSettings(doctorId: string, input: SaveGoogleMeetSettingsInput) {
    const parsed = saveGoogleMeetSettingsSchema.parse(input);
    const integration = await getDoctorIntegration(doctorId, "google_meet");
    if (!integration) throw new Error("Google Meet is not connected for this doctor.");

    return updateDoctorIntegration(integration.id, {
      metadata: {
        ...(integration.metadata as Record<string, unknown> | null),
        autoCreateMeetLink: parsed.autoCreateMeetLink,
        defaultOnlineConsultation: parsed.defaultOnlineConsultation
      }
    });
  },

  async createLink(input: CreateGoogleMeetLinkInput) {
    const parsed = createGoogleMeetLinkSchema.parse(input);
    const startsAt = new Date(parsed.startsAt);
    const endsAt = new Date(parsed.endsAt);
    const result = await createGoogleMeetCalendarEvent({
      doctorId: parsed.doctorId,
      appointmentId: parsed.appointmentId,
      summary: parsed.summary,
      patientName: parsed.patientName,
      startsAt,
      endsAt
    });

    await createDoctorMeetEvent({
      doctorId: parsed.doctorId,
      integrationId: result.integrationId,
      appointmentId: parsed.appointmentId,
      googleEventId: result.googleEventId,
      meetUrl: result.meetUrl,
      meetCode: result.meetCode,
      title: parsed.summary,
      startAt: startsAt,
      endAt: endsAt
    });

    await attachMeetingToAppointment({
      appointmentId: parsed.appointmentId,
      provider: "google_meet",
      meetingUrl: result.meetUrl,
      meetingEventId: result.googleEventId
    });

    return result;
  },

  async test(doctorId: string) {
    const integration = await getDoctorIntegration(doctorId, "google_meet");
    if (!integration || integration.status !== "connected" || !integration.isEnabled) {
      throw new Error("Google Meet is not connected for this doctor.");
    }
    await updateDoctorIntegration(integration.id, { lastTestedAt: new Date(), errorMessage: null });
    return { ok: true };
  }
};
