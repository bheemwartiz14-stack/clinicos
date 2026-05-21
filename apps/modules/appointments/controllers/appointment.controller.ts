import { appointmentService } from "../services/appointment.service";

export const appointmentController = {
  workspace: appointmentService.workspace,
  detail: appointmentService.detail,
  doctorWorkspace: appointmentService.doctorWorkspace,
  calendar: appointmentService.calendar,
  queue: appointmentService.queue
};
