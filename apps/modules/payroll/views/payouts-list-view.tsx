"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DollarSign, CheckCircle2, XCircle } from "lucide-react";
import { generatePayoutBatchAction, markPayoutPaidAction } from "../actions/payroll.actions";
import type { PayoutRecord } from "../services/payroll.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField, SelectField } from "@/components/form-controls";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  hold: "bg-blue-100 text-blue-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export function PayoutsListView({ payouts }: { payouts: PayoutRecord[] }) {
  const router = useRouter();
  const [generateOpen, setGenerateOpen] = useState(false);
  const now = new Date();

  const totalPending = payouts.filter((p) => p.status === "pending").length;
  const totalPaid = payouts.filter((p) => p.status === "paid").length;
  const pendingAmount = payouts.filter((p) => p.status === "pending").reduce((s, p) => s + parseFloat(p.totalEarnings), 0);
  const paidAmount = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + parseFloat(p.paidAmount), 0);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-6 rounded-full bg-primary/5" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">Payroll</Badge>
            <h1 className="text-2xl font-bold tracking-tight">Doctor Payouts</h1>
            <p className="text-sm text-muted-foreground">Monthly payout management for doctors.</p>
          </div>
          <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
            <DialogTrigger asChild>
              <Button>Generate Payouts</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Monthly Payouts</DialogTitle>
                <DialogDescription>Generate payout batch for a specific month and year.</DialogDescription>
              </DialogHeader>
              <form action={generatePayoutBatchAction} onSubmit={() => setTimeout(() => setGenerateOpen(false), 100)} className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Month" name="month" type="number" min="1" max="12" defaultValue={String(now.getMonth() + 1)} />
                  <FormField label="Year" name="year" type="number" min="2024" defaultValue={String(now.getFullYear())} />
                </div>
                <Button type="submit">Generate Batch</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Payouts", value: payouts.length, icon: DollarSign, color: "from-primary/10 to-primary/5 text-primary" },
          { label: "Pending", value: totalPending, icon: XCircle, color: "from-amber-500/10 to-amber-500/5 text-amber-600" },
          { label: "Paid", value: totalPaid, icon: CheckCircle2, color: "from-green-500/10 to-green-500/5 text-green-600" },
          { label: "Pending Amount", value: `$${pendingAmount.toFixed(2)}`, icon: DollarSign, color: "from-blue-500/10 to-blue-500/5 text-blue-600" },
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="px-5 py-4 font-semibold">Doctor</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Period</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Earnings</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Fixed</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Commission</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Paid</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Status</TableHead>
                <TableHead className="px-5 py-4 text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((p) => (
                <TableRow key={p.id} className="transition-colors hover:bg-muted/10">
                  <TableCell className="px-5 py-4 font-medium">{p.doctorName}</TableCell>
                  <TableCell className="px-5 py-4 text-sm">{months[p.month - 1]} {p.year}</TableCell>
                  <TableCell className="px-5 py-4 font-bold tabular-nums">${parseFloat(p.totalEarnings).toFixed(2)}</TableCell>
                  <TableCell className="px-5 py-4 tabular-nums">${parseFloat(p.fixedSalaryAmount).toFixed(2)}</TableCell>
                  <TableCell className="px-5 py-4 tabular-nums">${parseFloat(p.commissionAmount).toFixed(2)}</TableCell>
                  <TableCell className="px-5 py-4 tabular-nums">${parseFloat(p.paidAmount).toFixed(2)}</TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge className={STATUS_STYLES[p.status] || ""}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex justify-end">
                      {p.status === "pending" && (
                        <form action={markPayoutPaidAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <Button type="submit" variant="outline" size="sm">Mark Paid</Button>
                        </form>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {payouts.length === 0 && (
            <div className="flex flex-col items-center px-4 py-16 text-center">
              <DollarSign className="mb-4 h-8 w-8 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No payouts yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Generate a batch to get started.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export function PaymentHistoryView({ payouts }: { payouts: PayoutRecord[] }) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const totalPaid = payouts.reduce((s, p) => s + parseFloat(p.paidAmount), 0);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-6 rounded-full bg-primary/5" />
        <div className="relative">
          <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">Payroll</Badge>
          <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
          <p className="mt-1 text-sm text-muted-foreground">Completed doctor payout history.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
              <DollarSign className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="truncate text-sm text-muted-foreground">Completed Payments</p>
              <p className="text-2xl font-bold tabular-nums">{payouts.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 text-green-600">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="truncate text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold tabular-nums">${totalPaid.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="px-5 py-4 font-semibold">Doctor</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Period</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Amount</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Paid At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((p) => (
                <TableRow key={p.id} className="transition-colors hover:bg-muted/10">
                  <TableCell className="px-5 py-4 font-medium">{p.doctorName}</TableCell>
                  <TableCell className="px-5 py-4 text-sm">{months[p.month - 1]} {p.year}</TableCell>
                  <TableCell className="px-5 py-4 font-bold tabular-nums">${parseFloat(p.paidAmount).toFixed(2)}</TableCell>
                  <TableCell className="px-5 py-4 text-sm text-muted-foreground">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {payouts.length === 0 && (
            <div className="flex flex-col items-center px-4 py-16 text-center">
              <DollarSign className="mb-4 h-8 w-8 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No payment history</h3>
              <p className="mt-1 text-sm text-muted-foreground">Completed payouts will appear here.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
