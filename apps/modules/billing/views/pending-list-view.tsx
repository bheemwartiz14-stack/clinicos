"use client";

import Link from "next/link";
import { DollarSign, Eye } from "lucide-react";
import { useState } from "react";
import { recordPaymentAction } from "../actions/billing.actions";
import type { InvoiceRecord } from "../services/billing.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField, SelectField, TextareaField } from "@/components/form-controls";
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

export function PendingListView({ invoices }: { invoices: InvoiceRecord[] }) {
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);

  const totalPending = invoices.reduce((sum, i) => sum + parseFloat(i.totalAmount), 0);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-6 rounded-full bg-primary/5" />
        <div className="relative">
          <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">Billing</Badge>
          <h1 className="text-2xl font-bold tracking-tight">Pending Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">Invoices awaiting payment.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 text-amber-600">
              <DollarSign className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="truncate text-sm text-muted-foreground">Pending Invoices</p>
              <p className="text-2xl font-bold tabular-nums">{invoices.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5 text-red-600">
              <DollarSign className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="truncate text-sm text-muted-foreground">Total Pending Amount</p>
              <p className="text-2xl font-bold tabular-nums">${totalPending.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="px-5 py-4 font-semibold">Invoice</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Patient</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Amount</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Status</TableHead>
                <TableHead className="px-5 py-4 text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} className="transition-colors hover:bg-muted/10">
                  <TableCell className="px-5 py-4 font-mono font-semibold">{inv.invoiceNumber}</TableCell>
                  <TableCell className="px-5 py-4">{inv.patientName}</TableCell>
                  <TableCell className="px-5 py-4 font-bold tabular-nums">${parseFloat(inv.totalAmount).toFixed(2)}</TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge className="border-amber-200 bg-amber-50 text-amber-700">{inv.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setPaymentInvoiceId(inv.id)}>
                            <DollarSign className="h-4 w-4 mr-1" />Pay
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record Payment</DialogTitle>
                            <DialogDescription>Record payment for {inv.invoiceNumber}.</DialogDescription>
                          </DialogHeader>
                          <form action={recordPaymentAction} className="grid gap-4">
                            <input type="hidden" name="invoiceId" value={inv.id} />
                            <FormField label="Amount" name="amount" type="number" step="0.01" min="0" defaultValue={inv.totalAmount} required />
                            <SelectField label="Payment Method" name="method" required
                              options={[
                                { value: "cash", label: "Cash" },
                                { value: "upi", label: "UPI" },
                                { value: "card", label: "Card" },
                                { value: "bank_transfer", label: "Bank Transfer" },
                              ]}
                            />
                            <FormField label="Transaction ID" name="transactionId" />
                            <TextareaField label="Notes" name="notes" rows={2} />
                            <div className="flex justify-end gap-2 pt-2">
                              <Button type="submit" onClick={() => setTimeout(() => setPaymentInvoiceId(null), 100)}>Record Payment</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/billing/invoices/${inv.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {invoices.length === 0 && (
            <div className="flex flex-col items-center px-4 py-16 text-center">
              <DollarSign className="mb-4 h-8 w-8 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No pending payments</h3>
              <p className="mt-1 text-sm text-muted-foreground">All invoices are paid up.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
