"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, CreditCard, DollarSign } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { PaymentRecord } from "../services/billing.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const METHOD_ICONS: Record<string, string> = {
  cash: "bg-green-100 text-green-700",
  upi: "bg-blue-100 text-blue-700",
  card: "bg-purple-100 text-purple-700",
  bank_transfer: "bg-orange-100 text-orange-700",
};

export function PaymentsListView({ payments }: { payments: PaymentRecord[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState(searchParams.get("q") ?? "");

  const updateQuery = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/billing/payments?${params.toString()}`);
  }, [router, searchParams]);

  const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-6 rounded-full bg-primary/5" />
        <div className="relative">
          <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">Billing</Badge>
          <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
          <p className="mt-1 text-sm text-muted-foreground">View all recorded payments.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
              <CreditCard className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="truncate text-sm text-muted-foreground">Total Payments</p>
              <p className="text-2xl font-bold tabular-nums">{payments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 text-blue-600">
              <DollarSign className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="truncate text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold tabular-nums">${totalAmount.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border shadow-sm">
        <div className="p-4 border-b bg-muted/10">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input ref={searchRef} value={searchValue}
              onChange={(e) => { setSearchValue(e.target.value); updateQuery("q", e.target.value); }}
              placeholder="Search by invoice or patient..."
              className="h-11 border bg-muted/50 pl-12 pr-12 text-base focus-visible:bg-background"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="px-5 py-4 font-semibold">Invoice</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Patient</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Amount</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Method</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id} className="transition-colors hover:bg-muted/10">
                  <TableCell className="px-5 py-4">
                    <Link href={`/billing/invoices/${p.invoiceId}`} className="font-mono font-semibold hover:underline">
                      {p.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="px-5 py-4">{p.patientName}</TableCell>
                  <TableCell className="px-5 py-4 font-bold tabular-nums">${parseFloat(p.amount).toFixed(2)}</TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge className={METHOD_ICONS[p.method] || ""}>{p.method.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm text-muted-foreground">
                    {new Date(p.paidAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {payments.length === 0 && (
            <div className="flex flex-col items-center px-4 py-16 text-center">
              <CreditCard className="mb-4 h-8 w-8 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">No payments recorded</h3>
              <p className="mt-1 text-sm text-muted-foreground">Payments will appear here once recorded.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
