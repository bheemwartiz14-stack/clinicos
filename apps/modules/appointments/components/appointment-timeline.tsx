export function AppointmentTimeline({ events }: { events: Array<{ id: string; newStatus: string; changedAt: Date | string; reason?: string | null }> }) {
  return (
    <div className="grid gap-3">
      {events.map((event) => (
        <div key={event.id} className="rounded-lg border bg-background p-3 text-sm">
          <p className="font-semibold capitalize">{event.newStatus.replaceAll("_", " ")}</p>
          <p className="text-xs text-muted-foreground">{new Date(event.changedAt).toLocaleString()}</p>
          {event.reason ? <p className="mt-1 text-muted-foreground">{event.reason}</p> : null}
        </div>
      ))}
    </div>
  );
}
