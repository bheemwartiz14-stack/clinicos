"use client";

import { Activity, CalendarDays, CheckCircle2, CreditCard, TrendingUp, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  { label: "Total Patients", value: "1,248", change: "+12%", detail: "this month", icon: UsersRound },
  { label: "Appointments", value: "86", change: "+8%", detail: "this month", icon: CalendarDays },
  { label: "Revenue", value: "$12,420", change: "+18%", detail: "this month", icon: CreditCard },
  { label: "AI Notes", value: "342", change: "+24%", detail: "this month", icon: Activity }
];

const appointments = [
  { patient: "John Doe", doctor: "Dr. Smith", time: "09:30 AM", status: "Confirmed" },
  { patient: "Emma Watson", doctor: "Dr. Brown", time: "11:00 AM", status: "Waiting" },
  { patient: "Michael Lee", doctor: "Dr. Wilson", time: "01:15 PM", status: "Pending" }
];

function MetricCard({
  label,
  value,
  change,
  detail,
  icon: Icon
}: {
  label: string;
  value: string;
  change: string;
  detail: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <Card className="min-h-[126px] rounded-lg border-slate-200 bg-white py-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold leading-none tracking-normal text-slate-950">{value}</p>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-md bg-sky-50 text-sky-700">
            <Icon className="h-4 w-4" aria-hidden />
          </div>
        </div>
        <p className="mt-5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <TrendingUp className="h-3 w-3" aria-hidden />
          <span className="font-semibold text-emerald-600">{change}</span>
          {detail}
        </p>
      </CardContent>
    </Card>
  );
}

export function DashboardView() {
  return (
    <section className="mx-auto flex max-w-[1120px] flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-tight tracking-normal text-slate-950">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Welcome back. Here&apos;s your clinic overview.</p>
        </div>
        <Badge variant="outline" className="h-7 w-fit rounded-md border-emerald-200 bg-emerald-50 px-3 text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
          Operations healthy
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-lg border-slate-200 bg-white py-0 shadow-sm">
          <CardHeader className="px-4 pt-4">
            <CardTitle className="text-base font-semibold text-slate-950">Today&apos;s Appointments</CardTitle>
            <CardDescription className="text-xs">Upcoming patient visits</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">

            <div className="mt-5 space-y-3">
              {appointments.map((appointment) => (
                <div key={appointment.patient} className="flex min-h-[64px] items-center justify-between gap-4 rounded-md border border-slate-200 bg-white px-3 py-3 transition hover:bg-slate-50">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">{appointment.patient}</p>
                    <p className="mt-1 text-xs text-slate-500">{appointment.doctor}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline" className="hidden rounded-md text-xs sm:inline-flex">{appointment.status}</Badge>
                    <span className="rounded-md bg-sky-700 px-3 py-2 text-[11px] font-bold text-white">{appointment.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[287px] rounded-lg border-sky-200 bg-sky-50 py-0 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-sky-700 text-white">
                <Activity className="h-4 w-4" aria-hidden />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-950">AI Summary</h2>
                <p className="mt-1 text-xs text-slate-600">Generated insights</p>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-700">
              <p>Patient engagement increased by 18% this week.</p>
              <p>12 appointments are pending confirmation.</p>
              <p>AI notes automation reduced manual documentation by 30%.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
