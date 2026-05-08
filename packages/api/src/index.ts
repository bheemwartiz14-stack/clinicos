import { appointmentsRouter } from "./routers/appointments";
import { billingRouter } from "./routers/billing";
import { dashboardRouter } from "./routers/dashboard";
import { patientsRouter } from "./routers/patients";
import { prescriptionsRouter } from "./routers/prescriptions";
import { syncRouter } from "./routers/sync";
import { router } from "./trpc";

export const appRouter = router({
  appointments: appointmentsRouter,
  billing: billingRouter,
  dashboard: dashboardRouter,
  patients: patientsRouter,
  prescriptions: prescriptionsRouter,
  sync: syncRouter,
});

export type AppRouter = typeof appRouter;
