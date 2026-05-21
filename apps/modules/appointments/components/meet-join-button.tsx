export function MeetJoinButton({ href }: { href?: string | null }) {
  if (!href) return <span className="rounded-lg border border-dashed px-3 py-2 text-xs font-semibold text-muted-foreground">No Meet link</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
      Join Meet
    </a>
  );
}
