
export function QueueTokenCard({ entry }: { entry: any }) {
  return (
    <article className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-foreground">{entry.token}</p>
          <p className="mt-1 text-sm text-muted-foreground">{entry.patientFirstName} {entry.patientLastName}</p>
          <p className="mt-1 text-xs text-muted-foreground">Dr. {entry.doctorFirstName} {entry.doctorLastName}</p>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{entry.priority}</span>
      </div>
    </article>
  );
}
