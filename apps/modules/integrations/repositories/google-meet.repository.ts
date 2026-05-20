import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { appointments, doctorMeetEvents } from "@mediclinic/db";

export async function createDoctorMeetEvent(input: {
  doctorId: string;
  integrationId: string;
  appointmentId: string;
  googleEventId: string | null;
  meetUrl: string;
  meetCode?: string | null;
  title?: string | null;
  startAt: Date;
  endAt: Date;
}) {
  const [meetEvent] = await db
    .insert(doctorMeetEvents)
    .values({
      doctorId: input.doctorId,
      integrationId: input.integrationId,
      appointmentId: input.appointmentId,
      googleEventId: input.googleEventId,
      meetUrl: input.meetUrl,
      meetCode: input.meetCode ?? null,
      title: input.title ?? null,
      startAt: input.startAt,
      endAt: input.endAt,
      status: "active"
    } as any)
    .returning();

  return meetEvent;
}

export async function attachMeetingToAppointment(input: {
  appointmentId: string;
  provider: string;
  meetingUrl: string;
  meetingEventId: string | null;
}) {
  const [appointment] = await db
    .update(appointments)
    .set({
      meetingProvider: input.provider,
      meetingUrl: input.meetingUrl,
      meetingEventId: input.meetingEventId,
      meetingCreatedAt: new Date(),
      googleMeetLink: input.meetingUrl,
      googleCalendarEventId: input.meetingEventId,
      updatedAt: new Date()
    } as any)
    .where(eq(appointments.id, input.appointmentId))
    .returning();

  return appointment;
}
