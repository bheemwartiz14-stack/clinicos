import { router } from "./server";
import { appointmentRouter } from "@modules/appointments/controllers/trpc";
import { patientRouter } from "@modules/patients/controllers/trpc";

export const appRouter = router({
  patients: patientRouter,
  appointments: appointmentRouter
});

export type AppRouter = typeof appRouter;
