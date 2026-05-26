import type React from "react";
import { Activity, CalendarCheck, ShieldCheck, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthFormShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen bg-background px-5 py-10 text-foreground sm:px-8 lg:px-12">
      <div className="absolute right-5 top-5 sm:right-8 sm:top-8 lg:right-12 lg:top-10">
        <ThemeToggle />
      </div>
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-[980px] items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div className="mx-auto w-full max-w-[420px] lg:mx-0">
          <Badge variant="outline" className="mb-5 h-7 gap-2 rounded-md border-primary/20 bg-background px-3 text-primary-foreground/80">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Secure clinic workspace
          </Badge>

          <h1 className="max-w-[420px] text-[32px] font-bold leading-tight tracking-normal text-foreground sm:text-[38px]">
            Manage patients, appointments, and billing from one place.
          </h1>

          <p className="mt-4 max-w-[420px] text-sm leading-6 text-muted-foreground">
            Secure login for doctors, admins, receptionists, billing teams and clinic staff.
          </p>

          <div className="mt-7 grid max-w-[420px] grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "Patients", icon: Stethoscope },
              { label: "Appointments", icon: CalendarCheck },
              { label: "Billing", icon: Activity }
            ].map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex h-11 items-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground shadow-sm"
              >
                <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <Card className="mx-auto w-full max-w-[380px] gap-0 rounded-lg border-border bg-card py-0 shadow-lg shadow-black/5">
          <CardHeader className="px-6 pb-5 pt-6 text-center sm:px-7">
            <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-md bg-foreground text-background shadow-sm">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl font-bold tracking-normal text-foreground">{title}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">{subtitle}</CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6 sm:px-7">
            {children}

            <p className="mt-5 text-center text-[11px] font-medium text-muted-foreground">Protected access for clinic team members only.</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
