import type { QueueRecord } from "../types/appointment.types";
import { QueueTokenCard } from "./queue-token-card";

export function AppointmentQueueBoard({ queue }: { queue: QueueRecord[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {queue.map((entry) => <QueueTokenCard key={entry.id} entry={entry} />)}
      {queue.length === 0 ? <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground md:col-span-2 xl:col-span-3">No active queue tokens.</p> : null}
    </section>
  );
}
