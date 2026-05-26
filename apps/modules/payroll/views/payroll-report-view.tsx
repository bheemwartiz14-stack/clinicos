"use client";

import { useState } from "react";
import { FormField, SelectField } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payroll Report</h1>
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

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums">{report.totalDoctors}</p>
            <p className="text-xs text-muted-foreground">Doctors</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-green-600">${report.totalPaid.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total Paid</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-yellow-600">${report.totalPending.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total Pending</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold">Doctor Payouts</CardTitle>
          <CardDescription>Individual payout breakdown.</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Doctor</th>
                <th className="px-4 py-3 font-semibold">Earnings</th>
                <th className="px-4 py-3 font-semibold">Fixed</th>
                <th className="px-4 py-3 font-semibold">Commission</th>
                <th className="px-4 py-3 font-semibold">Paid</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {report.payouts.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">{p.doctorName}</td>
                  <td className="px-4 py-3 font-bold">${parseFloat(p.totalEarnings).toFixed(2)}</td>
                  <td className="px-4 py-3">${parseFloat(p.fixedSalaryAmount).toFixed(2)}</td>
                  <td className="px-4 py-3">${parseFloat(p.commissionAmount).toFixed(2)}</td>
                  <td className="px-4 py-3">${parseFloat(p.paidAmount).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Badge className={p.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
