import { schema } from "@mediclinicpro/db";
import { count, eq, gte, sum } from "drizzle-orm";
import { permissionProcedure, router } from "../trpc";

export const dashboardRouter = router({
  overview: permissionProcedure("dashboard.read").query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [patients] = await ctx.db.select({ value: count() }).from(schema.patients);
    const [appointments] = await ctx.db
      .select({ value: count() })
      .from(schema.appointments)
      .where(gte(schema.appointments.startsAt, today));
    const [revenue] = await ctx.db
      .select({ value: sum(schema.invoices.total) })
      .from(schema.invoices)
      .where(eq(schema.invoices.status, "paid"));

    return {
      patients: patients?.value ?? 0,
      appointmentsToday: appointments?.value ?? 0,
      revenue: Number(revenue?.value ?? 0),
      pendingSync: 0,
    };
  }),
});
