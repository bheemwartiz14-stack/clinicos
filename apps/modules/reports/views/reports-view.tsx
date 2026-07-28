"use client";

import { useRouter } from "next/navigation";
import { DollarSign, CalendarCheck2, Stethoscope, Users, TrendingUp, Activity, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ReportsOverview() {
  const router = useRouter();

  const reportCards = [
    {
      title: "Revenue Report",
      description: "View revenue trends, paid vs pending amounts.",
      icon: DollarSign,
      href: "/reports/revenue",
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Appointment Report",
      description: "Appointment statistics, completion and cancellation rates.",
      icon: CalendarCheck2,
      href: "/reports/appointments",
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Doctor Performance",
      description: "Doctor-wise appointment and completion metrics.",
      icon: Stethoscope,
      href: "/reports/doctors",
      color: "text-violet-600 bg-violet-100",
    },
    {
      title: "Patient Growth",
      description: "Patient registration trends over time.",
      icon: Users,
      href: "/reports/patients",
      color: "text-amber-600 bg-amber-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Analytics and performance reports for your clinic.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reportCards.map((card) => (
          <Card key={card.title} className="cursor-pointer border-0 shadow-sm transition hover:shadow-md"
            onClick={() => router.push(card.href)}>
            <CardContent className="p-6">
              <span className={`mb-4 grid h-12 w-12 place-items-center rounded-xl ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </span>
              <h3 className="font-semibold">{card.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function RevenueReportView({
  report,
}: {
  report: {
    totalRevenue: number;
    totalPaid: number;
    totalPending: number;
    invoiceCount: number;
    dailyRevenue: Array<{ date: string; revenue: number }>;
  };
}) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-6 rounded-full bg-primary/5" />
        <div className="relative">
          <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">
            <TrendingUp className="mr-1 h-3 w-3" /> Reports
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight">Revenue Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">Revenue analysis and trends.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Revenue", value: `$${report.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "from-green-500/10 to-green-500/5 text-green-600" },
          { label: "Collected", value: `$${report.totalPaid.toFixed(2)}`, icon: CheckCircle2, color: "from-blue-500/10 to-blue-500/5 text-blue-600" },
          { label: "Pending", value: `$${report.totalPending.toFixed(2)}`, icon: XCircle, color: "from-amber-500/10 to-amber-500/5 text-amber-600" },
          { label: "Total Invoices", value: report.invoiceCount, icon: CalendarCheck2, color: "from-primary/10 to-primary/5 text-primary" },
        ].map((stat) => (
          <Card key={stat.label} className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <CardContent className="flex items-center gap-4 p-5">
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-muted/10">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-primary" />
            Daily Revenue
          </CardTitle>
          <CardDescription>Revenue per day (paid invoices).</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          {report.dailyRevenue.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No revenue data for the selected period.</p>
          ) : (
            <div className="space-y-2">
              {report.dailyRevenue.map((day) => (
                <div key={day.date} className="flex items-center justify-between rounded-lg border bg-muted/10 px-4 py-3 transition-colors hover:bg-muted/20">
                  <span className="text-sm font-medium">{new Date(day.date).toLocaleDateString()}</span>
                  <span className="font-bold tabular-nums text-green-600">${day.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function AppointmentReportView({
  report,
}: {
  report: {
    totalAppointments: number;
    completionRate: number;
    cancellationRate: number;
    statusCounts: Record<string, number>;
  };
}) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-6 rounded-full bg-primary/5" />
        <div className="relative">
          <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">
            <CalendarCheck2 className="mr-1 h-3 w-3" /> Reports
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight">Appointment Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">Appointment statistics and trends.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total", value: report.totalAppointments, icon: CalendarCheck2, color: "from-primary/10 to-primary/5 text-primary" },
          { label: "Completion Rate", value: `${report.completionRate}%`, icon: CheckCircle2, color: "from-green-500/10 to-green-500/5 text-green-600" },
          { label: "Cancellation Rate", value: `${report.cancellationRate}%`, icon: XCircle, color: "from-red-500/10 to-red-500/5 text-red-600" },
        ].map((stat) => (
          <Card key={stat.label} className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <CardContent className="flex items-center gap-4 p-5">
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-muted/10">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Activity className="h-4 w-4 text-primary" />
            Status Breakdown
          </CardTitle>
          <CardDescription>Appointments by status.</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          {Object.keys(report.statusCounts).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No appointment data for the selected period.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(report.statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-lg border bg-muted/10 px-4 py-3 transition-colors hover:bg-muted/20">
                  <span className="text-sm font-medium capitalize">{status.replace(/_/g, " ")}</span>
                  <span className="font-bold tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function DoctorPerformanceView({
  reports,
}: {
  reports: Array<{
    doctorId: string;
    doctorName: string;
    specialty: string;
    appointmentCount: number;
    completedCount: number;
    completionRate: number;
  }>;
}) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-6 rounded-full bg-primary/5" />
        <div className="relative">
          <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">
            <Stethoscope className="mr-1 h-3 w-3" /> Reports
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight">Doctor Performance</h1>
          <p className="mt-1 text-sm text-muted-foreground">Doctor-wise performance metrics.</p>
        </div>
      </div>

      <Card className="overflow-hidden border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Doctor</th>
                <th className="px-5 py-3.5 font-semibold">Specialty</th>
                <th className="px-5 py-3.5 font-semibold">Appointments</th>
                <th className="px-5 py-3.5 font-semibold">Completed</th>
                <th className="px-5 py-3.5 font-semibold">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports.map((r) => (
                <tr key={r.doctorId} className="transition-colors hover:bg-muted/10">
                  <td className="px-5 py-3.5 font-medium">{r.doctorName}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{r.specialty}</td>
                  <td className="px-5 py-3.5 tabular-nums">{r.appointmentCount}</td>
                  <td className="px-5 py-3.5 tabular-nums">{r.completedCount}</td>
                  <td className="px-5 py-3.5">
                    <Badge className={r.completionRate >= 70 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
                      {r.completionRate}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reports.length === 0 && (
            <div className="flex flex-col items-center px-4 py-16 text-center">
              <Stethoscope className="mb-4 h-8 w-8 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No performance data</h3>
              <p className="mt-1 text-sm text-muted-foreground">Data will appear once appointments are completed.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export function PatientGrowthView({
  data,
}: {
  data: Array<{ month: string; count: number }>;
}) {
  const totalPatients = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-6 rounded-full bg-primary/5" />
        <div className="relative">
          <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">
            <Users className="mr-1 h-3 w-3" /> Reports
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight">Patient Growth</h1>
          <p className="mt-1 text-sm text-muted-foreground">Patient registration trends.</p>
        </div>
      </div>

      <Card className="border shadow-sm transition-all duration-200 hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-5">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
            <Users className="h-7 w-7 text-white" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Total Registered Patients</p>
            <p className="text-3xl font-bold tabular-nums">{totalPatients}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-muted/10">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4 text-primary" />
            Monthly Registrations
          </CardTitle>
          <CardDescription>New patients per month.</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          {data.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No patient registration data available.</p>
          ) : (
            <div className="space-y-2">
              {data.map((item) => (
                <div key={item.month} className="flex items-center justify-between rounded-lg border bg-muted/10 px-4 py-3 transition-colors hover:bg-muted/20">
                  <span className="text-sm font-medium">
                    {new Date(item.month).toLocaleDateString("en", { month: "long", year: "numeric" })}
                  </span>
                  <span className="font-bold tabular-nums text-primary">{item.count} new</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
