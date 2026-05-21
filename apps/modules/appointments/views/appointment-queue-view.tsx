import type { QueueRecord } from "../types/appointment.types";
import { AppointmentQueueBoard } from "../components/appointment-queue-board";

export function AppointmentQueueView({ queue }: { queue: QueueRecord[] }) {
  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-3xl font-semibold text-foreground">Queue & Tokens</h1>
        <p className="mt-2 text-sm text-muted-foreground">Reception and doctor queue board with token status and estimated wait flow.</p>
      </section>
      <AppointmentQueueBoard queue={queue} />
    </div>
  );
}
