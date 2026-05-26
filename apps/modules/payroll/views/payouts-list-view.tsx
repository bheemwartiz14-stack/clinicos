"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { generatePayoutBatchAction, markPayoutPaidAction } from "../actions/payroll.actions";
import type { PayoutRecord } from "../services/payroll.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField, SelectField } from "@/components/form-controls";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Doctor Payouts</h1>
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

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums">{payouts.length}</p>
            <p className="text-xs text-muted-foreground">Total Payouts</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-yellow-600">{totalPending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-green-600">{totalPaid}</p>
            <p className="text-xs text-muted-foreground">Paid</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums">${pendingAmount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Pending Amount</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Doctor</th>
                <th className="px-4 py-3 font-semibold">Period</th>
                <th className="px-4 py-3 font-semibold">Earnings</th>
                <th className="px-4 py-3 font-semibold">Fixed</th>
                <th className="px-4 py-3 font-semibold">Commission</th>
                <th className="px-4 py-3 font-semibold">Paid</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payouts.map((p) => {
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium">{p.doctorName}</td>
                    <td className="px-4 py-3">{months[p.month - 1]} {p.year}</td>
                    <td className="px-4 py-3 font-bold">${parseFloat(p.totalEarnings).toFixed(2)}</td>
                    <td className="px-4 py-3">${parseFloat(p.fixedSalaryAmount).toFixed(2)}</td>
                    <td className="px-4 py-3">${parseFloat(p.commissionAmount).toFixed(2)}</td>
                    <td className="px-4 py-3">${parseFloat(p.paidAmount).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge className={STATUS_STYLES[p.status] || ""}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {p.status === "pending" && (
                        <form action={markPayoutPaidAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <Button type="submit" variant="outline" size="sm">Mark Paid</Button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {payouts.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              No payouts yet. Generate a batch to get started.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export function PaymentHistoryView({ payouts }: { payouts: PayoutRecord[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payment History</h1>
        <p className="text-sm text-muted-foreground">Completed doctor payout history.</p>
      </div>

      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Doctor</th>
                <th className="px-4 py-3 font-semibold">Period</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Paid At</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payouts.map((p) => {
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium">{p.doctorName}</td>
                    <td className="px-4 py-3">{months[p.month - 1]} {p.year}</td>
                    <td className="px-4 py-3 font-bold">${parseFloat(p.paidAmount).toFixed(2)}</td>
                    <td className="px-4 py-3">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {payouts.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              No payment history yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
