
export function SlotSelector({ slots }: { slots: any[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {slots.map((slot) => (
        <button key={`${slot.doctorId}-${slot.startsAt.toISOString()}`} type="button" className="rounded-lg border bg-background px-3 py-2 text-left text-sm transition hover:border-primary/40">
          <span className="font-semibold">{slot.startsAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
          <span className="ml-2 text-xs capitalize text-muted-foreground">{slot.status.replaceAll("_", " ")}</span>
        </button>
      ))}
    </div>
  );
}
