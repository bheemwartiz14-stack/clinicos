"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, X, FileText, CreditCard, DollarSign, Receipt, Eye, Trash2, ArrowLeft } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { deleteInvoiceAction, recordPaymentAction } from "../actions/billing.actions";
import type { InvoiceRecord, InvoiceItemRecord, PaymentRecord } from "../services/billing.service";
import { FormField, SelectField, TextareaField } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  partial: "bg-blue-100 text-blue-800 border-blue-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  refunded: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
};

export function InvoicesListView({ invoices }: { invoices: InvoiceRecord[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState(searchParams.get("q") ?? "");
  const statusFilter = searchParams.get("status") ?? "all";

  const updateQuery = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`/billing/invoices?${params.toString()}`);
    },
    [router, searchParams],
  );

  const pending = invoices.filter((i) => i.paymentStatus === "pending").length;
  const paid = invoices.filter((i) => i.paymentStatus === "paid").length;
  const total = invoices.reduce((sum, i) => sum + parseFloat(i.totalAmount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">Billing</Badge>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground">Manage patient invoices and payments.</p>
        </div>
        <Button asChild>
          <Link href="/billing/invoices/create">
            <Plus className="h-4 w-4" aria-hidden />
            Create Invoice
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Invoices", value: invoices.length, icon: FileText, color: "text-primary bg-primary/10" },
          { label: "Pending", value: pending, icon: CreditCard, color: "text-yellow-600 bg-yellow-100" },
          { label: "Paid", value: paid, icon: DollarSign, color: "text-green-600 bg-green-100" },
          { label: "Total Revenue", value: `$${total.toFixed(2)}`, icon: Receipt, color: "text-blue-600 bg-blue-100" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={searchValue}
              onChange={(e) => { setSearchValue(e.target.value); updateQuery("q", e.target.value); }}
              placeholder="Search by invoice number, patient name, or phone..."
              className="h-12 border bg-muted/50 pl-12 pr-12 text-base focus-visible:bg-background"
            />
            {searchValue && (
              <button type="button" onClick={() => { setSearchValue(""); updateQuery("q", ""); searchRef.current?.focus(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "paid", label: "Paid" },
              { key: "partial", label: "Partial" },
              { key: "failed", label: "Failed" },
              { key: "refunded", label: "Refunded" },
            ].map((tab) => (
              <button key={tab.key} type="button"
                onClick={() => updateQuery("status", tab.key === "all" ? "" : tab.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${statusFilter === tab.key ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="px-5 py-4 font-semibold">Invoice</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Patient</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Amount</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Status</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Date</TableHead>
                <TableHead className="px-5 py-4 text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} className="group">
                  <TableCell className="px-5 py-4">
                    <span className="font-mono text-sm font-semibold">{inv.invoiceNumber}</span>
                  </TableCell>
                  <TableCell className="px-5 py-4">{inv.patientName}</TableCell>
                  <TableCell className="px-5 py-4 font-bold tabular-nums">${parseFloat(inv.totalAmount).toFixed(2)}</TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge className={`${STATUS_STYLES[inv.paymentStatus] || ""}`}>
                      {inv.paymentStatus.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-muted-foreground">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/billing/invoices/${inv.id}`}><Eye className="h-4 w-4" /><span className="sr-only">View</span></Link>
                      </Button>
                      <form action={deleteInvoiceAction}>
                        <input type="hidden" name="id" value={inv.id} />
                        <Button type="submit" variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" /><span className="sr-only">Delete</span>
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {invoices.length === 0 && (
            <div className="flex flex-col items-center px-4 py-16 text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-muted">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold">No invoices found</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">Create your first invoice to get started.</p>
              <Button asChild className="mt-4"><Link href="/billing/invoices/create"><Plus className="h-4 w-4" /> Create Invoice</Link></Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
