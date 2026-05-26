import { and, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import {
  db,
  appointments,
  patients,
  doctors,
  users,
  invoices,
  payments,
  doctorSpecialties,
} from "@mediclinic/db";

export const reportsService = {
  async revenueReport(fromDate: string, toDate: string) {
    const [revenueData] = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(${invoices.totalAmount}), '0')`,
        totalPaid: sql<string>`COALESCE(SUM(CASE WHEN ${invoices.paymentStatus} = 'paid' THEN ${invoices.totalAmount} ELSE 0 END), '0')`,
        totalPending: sql<string>`COALESCE(SUM(CASE WHEN ${invoices.paymentStatus} = 'pending' THEN ${invoices.totalAmount} ELSE 0 END), '0')`,
        invoiceCount: count(),
      })
      .from(invoices)
      .where(
        and(
          gte(invoices.createdAt, new Date(fromDate + "T00:00:00")),
          lte(invoices.createdAt, new Date(toDate + "T23:59:59")),
        )
      );

    const dailyRevenue = await db
      .select({
        date: sql<string>`DATE(${invoices.createdAt})`,
        revenue: sql<string>`COALESCE(SUM(${invoices.totalAmount}), '0')`,
      })
      .from(invoices)
      .where(eq(invoices.paymentStatus, "paid"))
      .groupBy(sql`DATE(${invoices.createdAt})`)
      .orderBy(sql`DATE(${invoices.createdAt})`);

    return {
      totalRevenue: parseFloat(revenueData?.totalRevenue ?? "0"),
      totalPaid: parseFloat(revenueData?.totalPaid ?? "0"),
      totalPending: parseFloat(revenueData?.totalPending ?? "0"),
      invoiceCount: Number(revenueData?.invoiceCount ?? 0),
      dailyRevenue: dailyRevenue.map((r) => ({
        date: r.date,
        revenue: parseFloat(r.revenue),
      })),
    };
  },

  async appointmentReport(fromDate: string, toDate: string) {
    const statusCounts = await db
      .select({
        status: appointments.status,
        count: count(),
      })
      .from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, fromDate),
          lte(appointments.appointmentDate, toDate),
        )
      )
      .groupBy(appointments.status);

    const totalAppointments = statusCounts.reduce((sum, r) => sum + Number(r.count), 0);
    const completed = statusCounts.find((r) => r.status === "completed");
    const cancelled = statusCounts.find((r) => r.status === "cancelled");

    return {
      totalAppointments,
      completionRate: totalAppointments > 0 ? Math.round((Number(completed?.count ?? 0) / totalAppointments) * 100) : 0,
      cancellationRate: totalAppointments > 0 ? Math.round((Number(cancelled?.count ?? 0) / totalAppointments) * 100) : 0,
      statusCounts: Object.fromEntries(statusCounts.map((r) => [r.status, Number(r.count)])),
    };
  },

  async doctorPerformanceReport(fromDate: string, toDate: string) {
    const rows = await db
      .select({
        doctorId: doctors.id,
        doctorName: sql<string>`${users.firstName} || ' ' || COALESCE(${users.lastName}, '')`,
        specialty: doctorSpecialties.name,
        appointmentCount: count(),
        completedCount: sql<number>`COUNT(CASE WHEN ${appointments.status} = 'completed' THEN 1 END)`,
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .leftJoin(doctorSpecialties, eq(doctors.specialtyId, doctorSpecialties.id))
      .leftJoin(
        appointments,
        and(
          eq(appointments.doctorId, doctors.id),
          gte(appointments.appointmentDate, fromDate),
          lte(appointments.appointmentDate, toDate),
        )
      )
      .groupBy(doctors.id, users.firstName, users.lastName, doctorSpecialties.name);

    return rows.map((r) => ({
      doctorId: r.doctorId,
      doctorName: r.doctorName.trim(),
      specialty: r.specialty ?? "General",
      appointmentCount: Number(r.appointmentCount),
      completedCount: Number(r.completedCount),
      completionRate: Number(r.appointmentCount) > 0 ? Math.round((Number(r.completedCount) / Number(r.appointmentCount)) * 100) : 0,
    }));
  },

  async patientGrowthReport() {
    const monthly = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${patients.createdAt})`,
        count: count(),
      })
      .from(patients)
      .groupBy(sql`DATE_TRUNC('month', ${patients.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${patients.createdAt})`);

    return monthly.map((r) => ({
      month: r.month,
      count: Number(r.count),
    }));
  },
};
