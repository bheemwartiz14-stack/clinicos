import {
  attachGoogleCalendarEvent,
  cancelAppointment,
  checkInAppointment,
  createAppointment,
  findOverlappingAppointment,
  getAppointmentDetail,
  listAppointmentWorkspace,
  listBookingDoctors,
  listBookingPatients,
  listQueueEntries,
  listUpcomingAppointments,
  rescheduleAppointment,
  saveAiPrediction,
  saveMeetSession,
  updateAppointmentStatus,
  updateQueueStatus
} from "../repositories/appointment.repository";
import {
  appointmentCheckInSchema,
  appointmentCancelSchema,
  appointmentCreateSchema,
  appointmentQueueUpdateSchema,
  appointmentRescheduleSchema,
  appointmentSlotGenerationSchema,
  appointmentStatusUpdateSchema,
  appointmentWalkInSchema,
  type AppointmentCheckInInput,
  type AppointmentCancelInput,
  type AppointmentCreateInput,
  type AppointmentQueueUpdateInput,
  type AppointmentRescheduleInput,
  type AppointmentSlotGenerationInput,
  type AppointmentStatusUpdateInput
} from "../validations/appointment.validation";
import { integrationService } from "@modules/integrations/services/integration.service";
import { googleMeetService } from "@modules/integrations/services/google-meet.service";
import { assertValidRange } from "../utils/overlap";
import { predictNoShowRisk, recommendSlots } from "../utils/ai-scheduling";
import { generateSlots } from "../utils/slot-generation";

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
    ]).then(([appointments, queue, patients, doctors]) => {
      const firstDoctor = doctors[0];
      const suggestions = firstDoctor
        ? recommendSlots(generateSlots({
            doctorId: firstDoctor.id,
            date: new Date(),
            visitDurationMinutes: firstDoctor.visitDurationMinutes ?? 20,
            appointments
          }), appointments)
        : [];
      return { appointments, queue, patients, doctors, suggestions };
    });
  },

  detail(branchId: string, appointmentId: string) {
    return getAppointmentDetail(branchId, appointmentId);
  },

  async calendar(branchId: string) {
    return this.workspace(branchId);
  },

  async queue(branchId: string) {
    return listQueueEntries(branchId);
  },

  async doctorWorkspace(branchId: string, doctorId: string) {
    const workspace = await this.workspace(branchId);
    return {
      ...workspace,
      appointments: workspace.appointments.filter((appointment) => appointment.doctorId === doctorId),
      queue: workspace.queue.filter((entry) => entry.doctorFirstName || entry.doctorLastName)
    };
  },

  async create(branchId: string, input: AppointmentCreateInput, bookedByUserId?: string) {
    const parsed = appointmentCreateSchema.parse(input);
    const startsAt = new Date(parsed.startsAt);
    const endsAt = new Date(parsed.endsAt);
    assertValidRange(startsAt, endsAt);
    const overlap = await findOverlappingAppointment(branchId, parsed.doctorId, startsAt, endsAt);
    if (overlap) throw new Error("This doctor already has an appointment or blocked calendar slot at that time.");

    if (parsed.consultationMode === "online") {
      const meetIntegration = await integrationService.get(parsed.doctorId, "google_meet");
      if (!meetIntegration || meetIntegration.status !== "connected" || !meetIntegration.isEnabled) {
        throw new Error("Google Meet is not connected for this doctor.");
      }
    }

    const appointment = await createAppointment(branchId, parsed);
    const prediction = predictNoShowRisk({ appointmentTime: startsAt, priority: parsed.queuePriority });
    await saveAiPrediction(appointment.id, { ...prediction, signals: { priority: parsed.queuePriority, bookedByUserId } });

    if (parsed.consultationMode === "online") {
      const meet = await googleMeetService.createLink({
        doctorId: parsed.doctorId,
        appointmentId: appointment.id,
        patientName: "Patient",
        startsAt: parsed.startsAt,
        endsAt: parsed.endsAt,
        summary: parsed.reason || "Online consultation"
      });
      if (meet?.meetUrl) {
        await saveMeetSession({ appointmentId: appointment.id, doctorId: parsed.doctorId, meetingUrl: meet.meetUrl, providerEventId: meet.googleEventId, startsAt, endsAt });
      }
    }

    return appointment;
  },

  async createWalkIn(branchId: string, input: AppointmentCreateInput, bookedByUserId?: string) {
    return this.create(branchId, appointmentWalkInSchema.parse({ ...input, appointmentType: "walk_in" }), bookedByUserId);
  },

  checkIn(branchId: string, input: AppointmentCheckInInput) {
    const parsed = appointmentCheckInSchema.parse(input);
    return checkInAppointment(branchId, parsed.appointmentId, parsed.priority);
  },

  updateStatus(branchId: string, input: AppointmentStatusUpdateInput, changedByUserId?: string) {
    const parsed = appointmentStatusUpdateSchema.parse(input);
    return updateAppointmentStatus(branchId, parsed.appointmentId, parsed.status, { changedByUserId, reason: parsed.reason });
  },

  async reschedule(branchId: string, input: AppointmentRescheduleInput, changedByUserId?: string) {
    const parsed = appointmentRescheduleSchema.parse(input);
    const startsAt = new Date(parsed.startsAt);
    const endsAt = new Date(parsed.endsAt);
    assertValidRange(startsAt, endsAt);
    return rescheduleAppointment(branchId, parsed.appointmentId, startsAt, endsAt, {
      changedByUserId,
      reason: parsed.reason,
      notifyPatient: parsed.notifyPatient
    });
  },

  cancel(branchId: string, input: AppointmentCancelInput, cancelledByUserId?: string) {
    const parsed = appointmentCancelSchema.parse(input);
    return cancelAppointment(branchId, parsed.appointmentId, {
      reason: parsed.reason,
      cancelledByUserId,
      notifyPatient: parsed.notifyPatient
    });
  },

  updateQueue(input: AppointmentQueueUpdateInput) {
    const parsed = appointmentQueueUpdateSchema.parse(input);
    return updateQueueStatus(parsed.appointmentId, parsed.queueStatus);
  },

  generateSlots(input: AppointmentSlotGenerationInput) {
    const parsed = appointmentSlotGenerationSchema.parse(input);
    return generateSlots({
      doctorId: parsed.doctorId,
      date: new Date(`${parsed.date}T00:00:00`),
      visitDurationMinutes: parsed.visitDurationMinutes,
      bufferMinutes: parsed.bufferMinutes
    });
  },

  attachCalendarEvent(appointmentId: string, data: { eventId: string; meetLink?: string | null }) {
    return attachGoogleCalendarEvent(appointmentId, data);
  }
};
