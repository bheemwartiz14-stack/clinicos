import { db, appointments, users, doctors, patients } from "@mediclinic/db";
import { eq } from "drizzle-orm";
import { googleCalendarService } from "@modules/integrations/google-calendar/google-calendar.service";
import type { CreateGoogleEventInput } from "@modules/integrations/google-calendar/google-calendar.type";

function formatTime(date: string, time: string): string {
  const hasSeconds = time.split(":").length === 3;
  return `${date}T${hasSeconds ? time : `${time}:00`}`;
}

export const AppointmentSyncService = {
  async syncOnCreate(appointmentId: string) {
    const [row] = await db
      .select({
        appointment: appointments,
        doctor: doctors,
        doctorUser: users,
        patient: patients,
      })
      .from(appointments)
      .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
      .innerJoin(users, eq(doctors.userId, users.id))
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!row) return;

    const doctorUserId = row.doctor.userId;
    const doctorName = [row.doctorUser.firstName, row.doctorUser.lastName].filter(Boolean).join(" ");
    const patientName = row.patient.fullName;
    const patientEmail = row.patient.email;

    const eventInput: CreateGoogleEventInput = {
      summary: `Appointment: ${patientName} with Dr. ${doctorName}`,
      description: [
        `Patient: ${patientName}`,
        `Doctor: Dr. ${doctorName}`,
        row.appointment.reason ? `Reason: ${row.appointment.reason}` : null,
        row.appointment.notes ? `Notes: ${row.appointment.notes}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      start: {
        dateTime: formatTime(row.appointment.appointmentDate, row.appointment.startTime),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: formatTime(row.appointment.appointmentDate, row.appointment.endTime ?? row.appointment.startTime),
        timeZone: "Asia/Kolkata",
      },
    };

    if (patientEmail) {
      eventInput.attendees = [
        { email: patientEmail },
      ];
    }

    if (row.appointment.type === "online" || row.appointment.type === "tele_consult") {
      eventInput.conferenceDataVersion = 1;
      eventInput.conferenceData = {
        createRequest: { requestId: crypto.randomUUID() },
      };
    }

    try {
      const result = await googleCalendarService.createCalendarEvent(doctorUserId, eventInput);
      await db
        .update(appointments)
        .set({ googleCalendarEventId: result.id })
        .where(eq(appointments.id, appointmentId));
    } catch (error) {
      console.error("Google Calendar sync failed on create:", error);
    }
  },

  async syncOnUpdate(appointmentId: string) {
    const [row] = await db
      .select({
        appointment: appointments,
        doctor: doctors,
        doctorUser: users,
        patient: patients,
      })
      .from(appointments)
      .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
      .innerJoin(users, eq(doctors.userId, users.id))
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!row?.appointment.googleCalendarEventId) return;

    const doctorUserId = row.doctor.userId;
    const doctorName = [row.doctorUser.firstName, row.doctorUser.lastName].filter(Boolean).join(" ");
    const patientName = row.patient.fullName;

    try {
      await googleCalendarService.updateCalendarEvent(doctorUserId, {
        eventId: row.appointment.googleCalendarEventId,
        summary: `Appointment: ${patientName} with Dr. ${doctorName}`,
        description: [
          `Patient: ${patientName}`,
          `Doctor: Dr. ${doctorName}`,
          row.appointment.reason ? `Reason: ${row.appointment.reason}` : null,
          row.appointment.notes ? `Notes: ${row.appointment.notes}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        start: {
          dateTime: formatTime(row.appointment.appointmentDate, row.appointment.startTime),
          timeZone: "Asia/Kolkata",
        },
        end: {
          dateTime: formatTime(row.appointment.appointmentDate, row.appointment.endTime ?? row.appointment.startTime),
          timeZone: "Asia/Kolkata",
        },
      });
    } catch {
      // Sync failed silently
    }
  },

  async syncOnDelete(appointmentId: string) {
    const [row] = await db
      .select({ appointment: appointments })
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!row?.appointment.googleCalendarEventId) return;

    const [doctorRow] = await db .select({ doctor: doctors })  .from(doctors)   .where(eq(doctors.id, row.appointment.doctorId))  .limit(1);
    if (!doctorRow) return;
    const doctorUserId = doctorRow.doctor.userId;

    try {
      await googleCalendarService.deleteCalendarEvent(
        doctorUserId,
        row.appointment.googleCalendarEventId,
      );
    } catch {
      // Sync failed silently
    }

    await db
      .update(appointments)
      .set({ googleCalendarEventId: null })
      .where(eq(appointments.id, appointmentId));
  },

  async syncOnCancel(appointmentId: string) {
    await this.syncOnDelete(appointmentId);
  },
};
