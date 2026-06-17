import { db, appointmentLogs } from "@mediclinic/db";
import { and, desc, eq, asc, count, gte, lte, type SQL } from "drizzle-orm";
import type { AppointmentLogFilters, PaginatedAppointmentLogsResponse } from "../types/appointment.types";

export const appointmentLogsRepository = {
  async insert(data: typeof appointmentLogs.$inferInsert) {
    const [created] = await db.insert(appointmentLogs).values(data).returning();
    return created;
  },

  async findById(id: string) {
    const [row] = await db.select().from(appointmentLogs).where(eq(appointmentLogs.id, id)).limit(1);
    return row ?? null;
  },

  async findByAppointmentId(appointmentId: string) {
    return db
      .select()
      .from(appointmentLogs)
      .where(eq(appointmentLogs.appointmentId, appointmentId))
      .orderBy(asc(appointmentLogs.createdAt));
  },

  async findMany(filters: AppointmentLogFilters = {}): Promise<PaginatedAppointmentLogsResponse> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;

    const clauses: SQL[] = [];
    if (filters.appointmentId) clauses.push(eq(appointmentLogs.appointmentId, filters.appointmentId));
    if (filters.action) clauses.push(eq(appointmentLogs.action, filters.action));
    if (filters.fromDate) clauses.push(gte(appointmentLogs.createdAt, filters.fromDate));
    if (filters.toDate) clauses.push(lte(appointmentLogs.createdAt, filters.toDate));

    const where = clauses.length > 0 ? and(...clauses) : undefined;

    const [rows, totalResult] = await Promise.all([
      db
        .select()
        .from(appointmentLogs)
        .where(where)
        .orderBy(desc(appointmentLogs.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(appointmentLogs)
        .where(where),
    ]);

    return {
      logs: rows,
      total: Number(totalResult[0]?.count ?? 0),
      page,
      limit,
    };
  },
};
