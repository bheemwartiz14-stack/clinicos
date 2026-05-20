import { Activity } from "lucide-react";

export function AuthFormShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border bg-card/90 p-6 shadow-xl shadow-teal-950/10 backdrop-blur">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">MediClinic Pro</p>
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">{subtitle}</p>
        {children}
      </section>
    </main>
  );
}
