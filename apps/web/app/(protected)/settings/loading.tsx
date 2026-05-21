export default function SettingsLoading() {
  return (
    <div className="grid gap-6">
      <div className="overflow-hidden rounded-xl border border-border bg-card/80 shadow-xl shadow-foreground/5">
        <div className="h-24 animate-pulse bg-muted" />
        <div className="flex gap-4 px-5 pb-5">
          <div className="-mt-10 h-24 w-24 rounded-xl border-4 border-background bg-muted" />
          <div className="mt-5 grid flex-1 gap-3">
            <div className="h-5 w-48 rounded bg-muted" />
            <div className="h-4 w-64 rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="h-80 rounded-xl border border-border bg-card/80" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-44 rounded-xl border border-border bg-card/80 p-5">
              <div className="h-11 w-11 rounded-lg bg-muted" />
              <div className="mt-5 h-5 w-36 rounded bg-muted" />
              <div className="mt-3 h-4 w-full rounded bg-muted" />
              <div className="mt-2 h-4 w-3/4 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
