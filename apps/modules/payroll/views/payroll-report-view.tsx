"use client";

import { DollarSign, CheckCircle2, XCircle, Stethoscope } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

type PayoutRecord = {
  id: string;
  doctorName: string;
  month: number;
  year: number;
  totalEarnings: string;
  fixedSalaryAmount: string;
  commissionAmount: string;
  paidAmount: string;
  status: string;
  paidAt: Date | null;
};

export function PayrollReportView({
  report,
  month,
  year,
}: {
  report: { payouts: PayoutRecord[]; totalPaid: number; totalPending: number; totalDoctors: number };
  month: number;
  year: number;
}) {
  const router = useRouter();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-6 rounded-full bg-primary/5" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">Payroll</Badge>
            <h1 className="text-2xl font-bold tracking-tight">Payroll Report</h1>
            <p className="text-sm text-muted-foreground">{months[month - 1]} {year} payroll summary.</p>
          </div>
          <div className="flex items-center gap-2">
            <form className="flex items-center gap-2">
              <select name="month" defaultValue={month}
                onChange={(e) => router.push(`/payroll/reports?month=${e.target.value}&year=${year}`)}
                className="h-9 rounded-md border bg-background px-3 text-xs"
              >
                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <select name="year" defaultValue={year}
                onChange={(e) => router.push(`/payroll/reports?month=${month}&year=${e.target.value}`)}
                className="h-9 rounded-md border bg-background px-3 text-xs"
              >
                {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </form>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Doctors", value: report.totalDoctors, icon: Stethoscope, color: "from-primary/10 to-primary/5 text-primary" },
          { label: "Total Paid", value: `$${report.totalPaid.toFixed(2)}`, icon: CheckCircle2, color: "from-green-500/10 to-green-500/5 text-green-600" },
          { label: "Total Pending", value: `$${report.totalPending.toFixed(2)}`, icon: XCircle, color: "from-amber-500/10 to-amber-500/5 text-amber-600" },
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

      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="border-b bg-muted/10">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <DollarSign className="h-4 w-4 text-primary" />
            Doctor Payouts
          </CardTitle>
          <CardDescription>Individual payout breakdown.</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="px-5 py-4 font-semibold">Doctor</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Earnings</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Fixed</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Commission</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Paid</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.payouts.map((p) => (
                <TableRow key={p.id} className="transition-colors hover:bg-muted/10">
                  <TableCell className="px-5 py-4 font-medium">{p.doctorName}</TableCell>
                  <TableCell className="px-5 py-4 font-bold tabular-nums">${parseFloat(p.totalEarnings).toFixed(2)}</TableCell>
                  <TableCell className="px-5 py-4 tabular-nums">${parseFloat(p.fixedSalaryAmount).toFixed(2)}</TableCell>
                  <TableCell className="px-5 py-4 tabular-nums">${parseFloat(p.commissionAmount).toFixed(2)}</TableCell>
                  <TableCell className="px-5 py-4 tabular-nums">${parseFloat(p.paidAmount).toFixed(2)}</TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge className={p.status === "paid" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
                      {p.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {report.payouts.length === 0 && (
            <div className="flex flex-col items-center px-4 py-12 text-center">
              <DollarSign className="mb-3 h-8 w-8 text-muted-foreground/50" />
              <h3 className="text-sm font-semibold">No payouts for this period</h3>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
