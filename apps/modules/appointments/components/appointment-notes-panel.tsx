export function AppointmentNotesPanel({ notes }: { notes: Array<{ id: string; body: string; createdAt: Date | string }> }) {
  return (
    <div className="grid gap-3">
      {notes.map((note) => (
        <article key={note.id} className="rounded-lg border bg-background p-3 text-sm">
          <p>{note.body}</p>
          <p className="mt-2 text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</p>
        </article>
      ))}
      {notes.length === 0 ? <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No appointment notes yet.</p> : null}
    </div>
  );
}
