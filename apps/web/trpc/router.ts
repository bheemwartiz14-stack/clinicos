import { router } from "./server";
import { appointmentRouter } from "@modules/appointments/controllers/trpc";

export const appRouter = router({
  appointments: appointmentRouter
});

export type AppRouter = typeof appRouter;
