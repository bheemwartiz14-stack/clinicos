import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { doctorAppointmentSlots, doctorCalendarBusyEvents } from "@mediclinic/db";
import type { GoogleCalendarBusyEvent } from "../types/integration.types";

export async function replaceIntegrationBusyEvents(input: {
  doctorId: string;
  integrationId: string;
  events: GoogleCalendarBusyEvent[];
}) {
  await db.transaction(async (tx) => {
    await tx
      .delete(doctorCalendarBusyEvents)
      .where(eq(doctorCalendarBusyEvents.integrationId, input.integrationId));

    if (input.events.length > 0) {
      await tx.insert(doctorCalendarBusyEvents).values(
        input.events.map((event) => ({
          doctorId: input.doctorId,
          integrationId: input.integrationId,
          providerEventId: event.providerEventId,
          calendarId: event.calendarId,
          title: event.title,
          startAt: event.startAt,
          endAt: event.endAt,
          isAllDay: event.isAllDay,
          status: event.status,
          source: "google"
        })) as any
      );
    }
  });
}

export async function listIntegrationBusyEvents(doctorId: string, startAt: Date, endAt: Date) {
  return db
    .select()
    .from(doctorCalendarBusyEvents)
    .where(and(
      eq(doctorCalendarBusyEvents.doctorId, doctorId),
      gte(doctorCalendarBusyEvents.startAt, startAt),
      lte(doctorCalendarBusyEvents.endAt, endAt),
      eq(doctorCalendarBusyEvents.status, "busy")
    ))
    .orderBy(doctorCalendarBusyEvents.startAt);
}

export async function markSlotsCalendarBusy(doctorId: string, events: GoogleCalendarBusyEvent[]) {
  for (const event of events) {
    const slotDate = event.startAt.toISOString().slice(0, 10);
    const startTime = event.startAt.toISOString().slice(11, 16);
    const endTime = event.endAt.toISOString().slice(11, 16);

    await db
      .update(doctorAppointmentSlots)
      .set({ status: "calendar_busy", updatedAt: new Date() } as any)
      .where(and(
        eq(doctorAppointmentSlots.doctorId, doctorId),
        eq(doctorAppointmentSlots.slotDate, slotDate),
        eq(doctorAppointmentSlots.status, "available"),
        sql`${doctorAppointmentSlots.startTime} < ${endTime}`,
        sql`${doctorAppointmentSlots.endTime} > ${startTime}`
      ));
  }
}
