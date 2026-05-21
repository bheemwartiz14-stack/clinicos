import { Activity, CalendarDays, CheckCircle2, CreditCard, TrendingUp, UsersRound } from "lucide-react";
import type { DashboardData, DashboardMetric } from "../types/dashboard.types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const metricIcons = {
  "AI Notes": Activity,
  Revenue: CreditCard,
  "Today Appointments": CalendarDays,
  "Total Patients": UsersRound
};

function MetricCard({
  label,
  value,
  change,
  detail,
  tone
}: DashboardMetric) {
  const Icon = metricIcons[label as keyof typeof metricIcons] ?? Activity;

  return (
    <Card className="min-h-[126px] rounded-lg bg-card py-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold leading-none tracking-normal text-foreground">{value}</p>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" aria-hidden />
          </div>
        </div>
        <p className="mt-5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <TrendingUp className="h-3 w-3" aria-hidden />
          <span className={tone === "warning" ? "font-semibold text-amber-600 dark:text-amber-400" : "font-semibold text-emerald-600 dark:text-emerald-400"}>{change}</span>
          {detail}
        </p>
      </CardContent>
    </Card>
  );
}

export function DashboardView({ data }: { data: DashboardData }) {
  return (
    <section className="mx-auto flex max-w-[1120px] flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-tight tracking-normal text-foreground">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">Welcome back. Here&apos;s your clinic overview.</p>
        </div>
        <Badge variant="outline" className="h-7 w-fit rounded-md border-emerald-500/25 bg-emerald-500/10 px-3 text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
          Operations healthy
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-lg bg-card py-0 shadow-sm">
          <CardHeader className="px-4 pt-4">
            <CardTitle className="text-base font-semibold text-foreground">Today&apos;s Appointments</CardTitle>
            <CardDescription className="text-xs">Upcoming patient visits</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">

            <div className="mt-5 space-y-3">
              {data.appointments.map((appointment) => (
                <div key={appointment.id} className="flex min-h-[64px] items-center justify-between gap-4 rounded-md border border-border bg-background px-3 py-3 transition hover:bg-muted/60">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{appointment.patient}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{appointment.doctor}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline" className="hidden rounded-md text-xs sm:inline-flex">{appointment.status}</Badge>
                    <span className="rounded-md bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground">{appointment.time}</span>
                  </div>
                </div>
              ))}
              {data.appointments.length === 0 ? (
                <div className="rounded-md border border-dashed border-border bg-background px-3 py-8 text-center text-sm text-muted-foreground">
                  No appointments scheduled for today.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[287px] rounded-lg border-primary/20 bg-primary/10 py-0 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
                <Activity className="h-4 w-4" aria-hidden />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">AI Summary</h2>
                <p className="mt-1 text-xs text-muted-foreground">Generated insights</p>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-sm leading-6 text-foreground/80">
              {data.aiSummary.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
