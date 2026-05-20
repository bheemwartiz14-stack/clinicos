"use client";

import { Activity, CalendarDays, CreditCard, TrendingUp, UsersRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const metrics = [
  { label: "Total Patients", value: "1,248", change: "+12% this month", icon: UsersRound },
  { label: "Appointments", value: "86", change: "+8% this month", icon: CalendarDays },
  { label: "Revenue", value: "$12,420", change: "+18% this month", icon: CreditCard },
  { label: "AI Notes", value: "342", change: "+24% this month", icon: Activity }
];

const appointments = [
  { patient: "John Doe", doctor: "Dr. Smith", time: "09:30 AM" },
  { patient: "Emma Watson", doctor: "Dr. Brown", time: "11:00 AM" },
  { patient: "Michael Lee", doctor: "Dr. Wilson", time: "01:15 PM" }
];

function MetricCard({ label, value, change, icon: Icon }: { label: string; value: string; change: string; icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }> }) {
  return (
    <Card className="min-h-[114px] rounded-md border border-zinc-200 bg-white py-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium text-zinc-500">{label}</p>
            <p className="mt-2 text-[24px] font-bold leading-none tracking-normal text-black">{value}</p>
          </div>
          <div className="grid h-[34px] w-[34px] place-items-center rounded-md bg-cyan-50 text-cyan-700">
            <Icon className="h-[17px] w-[17px]" aria-hidden />
          </div>
        </div>
        <p className="mt-5 flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
          <TrendingUp className="h-3 w-3" aria-hidden />
          {change}
        </p>
      </CardContent>
    </Card>
  );
}

export function DashboardView() {
  return (
    <section className="mx-auto flex max-w-[1072px] flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-bold leading-tight text-black">Dashboard</h1>
        <p className="mt-2 text-[12px] text-zinc-600">Welcome back. Here&apos;s your clinic overview.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_345px]">
        <Card className="rounded-md border border-zinc-200 bg-white py-0 shadow-sm">
          <CardContent className="p-4">
            <div>
              <h2 className="text-[14px] font-bold text-black">Today Appointments</h2>
              <p className="mt-1 text-[12px] text-zinc-600">Upcoming patient visits</p>
            </div>

            <div className="mt-5 space-y-3">
              {appointments.map((appointment) => (
                <div key={appointment.patient} className="flex min-h-[59px] items-center justify-between gap-4 rounded-md border border-zinc-200 bg-white px-3 py-3">
                  <div>
                    <p className="text-[14px] font-semibold text-black">{appointment.patient}</p>
                    <p className="mt-1 text-[12px] text-zinc-600">{appointment.doctor}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-cyan-700 px-3 py-2 text-[11px] font-bold text-white">
                    {appointment.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[287px] rounded-md border border-sky-200 bg-sky-50 py-0 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-[34px] w-[34px] place-items-center rounded-md bg-cyan-700 text-white">
                <Activity className="h-[18px] w-[18px]" aria-hidden />
              </div>
              <div>
                <h2 className="text-[14px] font-bold text-black">AI Summary</h2>
                <p className="mt-1 text-[12px] text-zinc-600">Generated insights</p>
              </div>
            </div>

            <div className="mt-5 space-y-5 text-[12px] leading-relaxed text-zinc-700">
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
