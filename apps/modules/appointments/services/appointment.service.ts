import {
  attachGoogleCalendarEvent,
  checkInAppointment,
  createAppointment,
  listAppointmentWorkspace,
  listBookingDoctors,
  listBookingPatients,
  listQueueEntries,
  listUpcomingAppointments,
  rescheduleAppointment,
  updateAppointmentStatus
} from "../repositories/appointment.repository";
import {
  appointmentCheckInSchema,
  appointmentCreateSchema,
  appointmentRescheduleSchema,
  appointmentStatusUpdateSchema,
  type AppointmentCheckInInput,
  type AppointmentCreateInput,
  type AppointmentRescheduleInput,
  type AppointmentStatusUpdateInput
} from "../validations/appointment.validation";
import { integrationService } from "@modules/integrations/services/integration.service";
import { googleMeetService } from "@modules/integrations/services/google-meet.service";

export const appointmentService = {
  listUpcoming(branchId: string) {
    return listUpcomingAppointments(branchId);
  },

  workspace(branchId: string) {
    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - 14);
    const to = new Date(now);
    to.setDate(now.getDate() + 45);

    return Promise.all([
      listAppointmentWorkspace(branchId, { from, to }),
      listQueueEntries(branchId),
      listBookingPatients(branchId),
      listBookingDoctors(branchId)
    ]).then(([appointments, queue, patients, doctors]) => ({ appointments, queue, patients, doctors }));
  },

  async create(branchId: string, input: AppointmentCreateInput) {
    const parsed = appointmentCreateSchema.parse(input);
    if (parsed.consultationMode === "online") {
      const meetIntegration = await integrationService.get(parsed.doctorId, "google_meet");
      if (!meetIntegration || meetIntegration.status !== "connected" || !meetIntegration.isEnabled) {
        throw new Error("Google Meet is not connected for this doctor.");
      }
    }

    const appointment = await createAppointment(branchId, parsed);

    if (parsed.consultationMode === "online") {
      await googleMeetService.createLink({
        doctorId: parsed.doctorId,
        appointmentId: appointment.id,
        patientName: "Patient",
        startsAt: parsed.startsAt,
        endsAt: parsed.endsAt,
        summary: parsed.reason || "Online consultation"
      });
    }

    return appointment;
  },

  checkIn(branchId: string, input: AppointmentCheckInInput) {
    const parsed = appointmentCheckInSchema.parse(input);
    return checkInAppointment(branchId, parsed.appointmentId, parsed.priority);
  },

  updateStatus(branchId: string, input: AppointmentStatusUpdateInput) {
    const parsed = appointmentStatusUpdateSchema.parse(input);
    return updateAppointmentStatus(branchId, parsed.appointmentId, parsed.status);
  },

  reschedule(branchId: string, input: AppointmentRescheduleInput) {
    const parsed = appointmentRescheduleSchema.parse(input);
    return rescheduleAppointment(branchId, parsed.appointmentId, new Date(parsed.startsAt), new Date(parsed.endsAt));
  },

  attachCalendarEvent(appointmentId: string, data: { eventId: string; meetLink?: string | null }) {
    return attachGoogleCalendarEvent(appointmentId, data);
  }
};
