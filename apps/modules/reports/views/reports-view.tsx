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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Revenue Report</h1>
        <p className="text-sm text-muted-foreground">Revenue analysis and trends.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-green-600">${report.totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-blue-600">${report.totalPaid.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Collected</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-yellow-600">${report.totalPending.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums">{report.invoiceCount}</p>
            <p className="text-xs text-muted-foreground">Total Invoices</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold">Daily Revenue</CardTitle>
          <CardDescription>Revenue per day (paid invoices).</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid gap-2">
            {report.dailyRevenue.map((day) => (
              <div key={day.date} className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3">
                <span className="text-sm font-medium">{new Date(day.date).toLocaleDateString()}</span>
                <span className="font-bold text-green-600">${day.revenue.toFixed(2)}</span>
              </div>
            ))}
            {report.dailyRevenue.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No revenue data for the selected period.</p>
            )}
          </div>
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Appointment Report</h1>
        <p className="text-sm text-muted-foreground">Appointment statistics and trends.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums">{report.totalAppointments}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-green-600">{report.completionRate}%</p>
            <p className="text-xs text-muted-foreground">Completion Rate</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-red-600">{report.cancellationRate}%</p>
            <p className="text-xs text-muted-foreground">Cancellation Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold">Status Breakdown</CardTitle>
          <CardDescription>Appointments by status.</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid gap-2">
            {Object.entries(report.statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3">
                <span className="text-sm font-medium capitalize">{status.replace(/_/g, " ")}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
            {Object.keys(report.statusCounts).length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No appointment data for the selected period.</p>
            )}
          </div>
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Doctor Performance</h1>
        <p className="text-sm text-muted-foreground">Doctor-wise performance metrics.</p>
      </div>

      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Doctor</th>
                <th className="px-4 py-3 font-semibold">Specialty</th>
                <th className="px-4 py-3 font-semibold">Appointments</th>
                <th className="px-4 py-3 font-semibold">Completed</th>
                <th className="px-4 py-3 font-semibold">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports.map((r) => (
                <tr key={r.doctorId}>
                  <td className="px-4 py-3 font-medium">{r.doctorName}</td>
                  <td className="px-4 py-3">{r.specialty}</td>
                  <td className="px-4 py-3">{r.appointmentCount}</td>
                  <td className="px-4 py-3">{r.completedCount}</td>
                  <td className="px-4 py-3">
                    <Badge className={r.completionRate >= 70 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {r.completionRate}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reports.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              No performance data available.
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Patient Growth</h1>
        <p className="text-sm text-muted-foreground">Patient registration trends.</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 text-center">
          <p className="text-3xl font-bold tabular-nums">{totalPatients}</p>
          <p className="text-xs text-muted-foreground">Total Registered Patients</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold">Monthly Registrations</CardTitle>
          <CardDescription>New patients per month.</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid gap-2">
            {data.map((item) => (
              <div key={item.month} className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3">
                <span className="text-sm font-medium">
                  {new Date(item.month).toLocaleDateString("en", { month: "long", year: "numeric" })}
                </span>
                <span className="font-bold">{item.count} new patients</span>
              </div>
            ))}
            {data.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No patient registration data available.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
