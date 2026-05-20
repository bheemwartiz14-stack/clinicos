import type React from "react";
import { Activity, CalendarCheck, ShieldCheck, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthFormShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-950 sm:px-8 lg:px-12">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-[980px] items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div className="mx-auto w-full max-w-[420px] lg:mx-0">
          <Badge variant="outline" className="mb-5 h-7 gap-2 rounded-md border-sky-200 bg-white px-3 text-sky-800">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Secure clinic workspace
          </Badge>

          <h1 className="max-w-[420px] text-[32px] font-bold leading-tight tracking-normal text-slate-950 sm:text-[38px]">
            Manage patients, appointments, and billing from one place.
          </h1>

          <p className="mt-4 max-w-[420px] text-sm leading-6 text-slate-600">
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
                className="flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm"
              >
                <Icon className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <Card className="mx-auto w-full max-w-[380px] gap-0 rounded-lg border-slate-200 bg-white py-0 shadow-lg shadow-slate-200/60">
          <CardHeader className="px-6 pb-5 pt-6 text-center sm:px-7">
            <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-md bg-slate-950 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl font-bold tracking-normal text-slate-950">{title}</CardTitle>
            <CardDescription className="text-xs text-slate-500">{subtitle}</CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6 sm:px-7">
            {children}

            <p className="mt-5 text-center text-[11px] font-medium text-slate-500">Protected access for clinic team members only.</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
