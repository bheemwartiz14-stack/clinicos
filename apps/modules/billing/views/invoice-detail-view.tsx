"use client";

import Link from "next/link";
import { ArrowLeft, Printer, DollarSign } from "lucide-react";
import { useState } from "react";
import { recordPaymentAction } from "../actions/billing.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField, SelectField, TextareaField } from "@/components/form-controls";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  partial: "bg-blue-100 text-blue-800 border-blue-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  refunded: "bg-gray-100 text-gray-800 border-gray-200",
};

type InvoiceData = {
  invoice: {
    id: string;
    invoiceNumber: string;
    patientId: string;
    patientName: string;
    appointmentId: string | null;
    subtotal: string;
    gstAmount: string;
    discountAmount: string;
    totalAmount: string;
    paymentStatus: string;
    invoicePdfUrl: string | null;
    createdAt: Date;
  };
  items: Array<{
    id: string;
    invoiceId: string;
    itemName: string;
    description: string | null;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
  payments: Array<{
    id: string;
    invoiceId: string;
    invoiceNumber: string;
    patientName: string;
    amount: string;
    method: string;
    status: string;
    transactionId: string | null;
    notes: string | null;
    paidAt: Date;
  }>;
};

export function InvoiceDetailView({ data }: { data: InvoiceData }) {
  const { invoice, items, payments } = data;
  const [paymentOpen, setPaymentOpen] = useState(false);
  const style = STATUS_STYLES[invoice.paymentStatus] || "";

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/[0.07] via-transparent to-background p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="h-9 w-9 shrink-0">
              <Link href="/billing/invoices"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-mono">{invoice.invoiceNumber}</h1>
                <Badge className={style}>{invoice.paymentStatus.replace("_", " ")}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{invoice.patientName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {invoice.paymentStatus !== "paid" && (
              <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
                <DialogTrigger asChild>
                  <Button><DollarSign className="h-4 w-4 mr-1" />Record Payment</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>Record a payment for invoice {invoice.invoiceNumber}.</DialogDescription>
                  </DialogHeader>
                  <form action={recordPaymentAction} onSubmit={() => setTimeout(() => setPaymentOpen(false), 100)} className="grid gap-4">
                    <input type="hidden" name="invoiceId" value={invoice.id} />
                    <FormField label="Amount" name="amount" type="number" step="0.01" min="0" required />
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
                      <Button type="button" variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
                      <Button type="submit">Record Payment</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            <Button asChild variant="outline"><Link href={`/billing/invoices/${invoice.id}`}><Printer className="h-4 w-4 mr-1" />Print</Link></Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-sm font-semibold">Patient</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            <DetailRow label="Name" value={invoice.patientName} />
            <DetailRow label="Invoice Date" value={new Date(invoice.createdAt).toLocaleDateString()} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-sm font-semibold">Invoice Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">Qty</th>
                  <th className="px-4 py-3 font-semibold">Rate</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.itemName}</div>
                      {item.description && <div className="text-xs text-muted-foreground">{item.description}</div>}
                    </td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">${parseFloat(item.unitPrice).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-medium">${parseFloat(item.totalPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t bg-muted/20">
                <tr><td colSpan={3} className="px-4 py-2 text-sm text-muted-foreground">Subtotal</td><td className="px-4 py-2 text-right">${parseFloat(invoice.subtotal).toFixed(2)}</td></tr>
                <tr><td colSpan={3} className="px-4 py-2 text-sm text-muted-foreground">GST</td><td className="px-4 py-2 text-right">${parseFloat(invoice.gstAmount).toFixed(2)}</td></tr>
                <tr><td colSpan={3} className="px-4 py-2 text-sm text-muted-foreground">Discount</td><td className="px-4 py-2 text-right">-${parseFloat(invoice.discountAmount).toFixed(2)}</td></tr>
                <tr className="border-t"><td colSpan={3} className="px-4 py-3 font-bold">Total</td><td className="px-4 py-3 text-right font-bold text-lg">${parseFloat(invoice.totalAmount).toFixed(2)}</td></tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      </div>

      {payments.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-sm font-semibold">Payment History</CardTitle>
            <CardDescription>All payments recorded against this invoice.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Transaction ID</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">{new Date(p.paidAt).toLocaleString()}</td>
                    <td className="px-4 py-3 capitalize">{p.method.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.transactionId || "—"}</td>
                    <td className="px-4 py-3 text-right font-bold">${parseFloat(p.amount).toFixed(2)}</td>
                    <td className="px-4 py-3"><Badge className={STATUS_STYLES[p.status] || ""}>{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
