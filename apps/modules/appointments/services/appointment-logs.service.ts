import { appointmentLogsRepository } from "../repository/appointment-logs.repository";
import type { AppointmentLogFilters, PaginatedAppointmentLogsResponse } from "../types/appointment.types";

export const appointmentLogsService = {
  async create(data: {
    appointmentId: string;
    action: string;
    message?: string | null;
    performedBy?: string | null;
    metadata?: Record<string, unknown> | null;
  }) {
    return appointmentLogsRepository.insert({
      appointmentId: data.appointmentId,
      action: data.action as any,
      message: data.message ?? null,
      performedBy: data.performedBy ?? null,
      metadata: data.metadata ?? null,
    });
  },

  async getByAppointmentId(appointmentId: string) {
    return appointmentLogsRepository.findByAppointmentId(appointmentId);
  },

  async list(filters: AppointmentLogFilters = {}): Promise<PaginatedAppointmentLogsResponse> {
    return appointmentLogsRepository.findMany(filters);
  },
};
