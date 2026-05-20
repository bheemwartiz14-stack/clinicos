import { ensureAccessToken } from "./calendar-busy-sync";
import { getDoctorIntegration, updateDoctorIntegration } from "../repositories/integration.repository";
import type { GoogleMeetLinkResult } from "../types/integration.types";

function extractMeetUrl(event: {
  hangoutLink?: string;
  conferenceData?: { entryPoints?: Array<{ uri?: string; entryPointType?: string }>; conferenceId?: string };
}) {
  return event.hangoutLink
    ?? event.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri
    ?? null;
}

export async function createGoogleMeetCalendarEvent(input: {
  doctorId: string;
  appointmentId: string;
  summary: string;
  patientName: string;
  startsAt: Date;
  endsAt: Date;
}): Promise<{ integrationId: string } & GoogleMeetLinkResult> {
  const integration = await getDoctorIntegration(input.doctorId, "google_meet");
  if (!integration || integration.status !== "connected" || !integration.isEnabled) {
    throw new Error("Google Meet is not connected for this doctor.");
  }

  const accessToken = await ensureAccessToken(integration, async (data) => {
    await updateDoctorIntegration(integration.id, {
      accessToken: data.accessToken,
      expiryDate: data.expiryDate,
      tokenType: data.tokenType,
      scope: data.scope
    });
  });

  const requestId = `mediclinic-${input.appointmentId}-${Date.now()}`;
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(integration.calendarId)}/events?conferenceDataVersion=1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        summary: input.summary,
        description: `MediClinic Pro online consultation for ${input.patientName}.`,
        start: { dateTime: input.startsAt.toISOString() },
        end: { dateTime: input.endsAt.toISOString() },
        conferenceData: {
          createRequest: {
            requestId,
            conferenceSolutionKey: { type: "hangoutsMeet" }
          }
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Google Meet link creation failed: ${await response.text()}`);
  }

  const event = await response.json() as {
    id: string;
    hangoutLink?: string;
    conferenceData?: { entryPoints?: Array<{ uri?: string; entryPointType?: string }>; conferenceId?: string };
  };
  const meetUrl = extractMeetUrl(event);
  if (!meetUrl) throw new Error("Google did not return a Meet link.");

  await updateDoctorIntegration(integration.id, {
    lastTestedAt: new Date(),
    errorMessage: null
  });

  return {
    integrationId: integration.id,
    googleEventId: event.id,
    meetUrl,
    meetCode: event.conferenceData?.conferenceId ?? null
  };
}
