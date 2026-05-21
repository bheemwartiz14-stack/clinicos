import { todayKey } from "../helpers/calendar.helper";
import { appointmentService } from "../services/appointment.service";

export async function appointmentsPageController(params: { branchId: string; selectedDate?: string }) {
  return appointmentService.getAppointmentsCalendarData(params.branchId, params.selectedDate || todayKey());
}
