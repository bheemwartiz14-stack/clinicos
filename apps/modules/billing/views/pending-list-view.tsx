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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pending Payments</h1>
        <p className="text-sm text-muted-foreground">Invoices awaiting payment.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-yellow-100 text-yellow-600">
              <DollarSign className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Pending Invoices</p>
              <p className="text-2xl font-bold tabular-nums">{invoices.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-red-100 text-red-600">
              <DollarSign className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Total Pending Amount</p>
              <p className="text-2xl font-bold tabular-nums">${totalPending.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-0 shadow-sm">
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
                <TableRow key={inv.id}>
                  <TableCell className="px-5 py-4 font-mono font-semibold">{inv.invoiceNumber}</TableCell>
                  <TableCell className="px-5 py-4">{inv.patientName}</TableCell>
                  <TableCell className="px-5 py-4 font-bold">${parseFloat(inv.totalAmount).toFixed(2)}</TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge className="bg-yellow-100 text-yellow-800">{inv.paymentStatus}</Badge>
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
