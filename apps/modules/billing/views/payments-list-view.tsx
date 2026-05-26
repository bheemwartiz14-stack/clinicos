"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, CreditCard } from "lucide-react";
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payment History</h1>
        <p className="text-sm text-muted-foreground">View all recorded payments.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-green-100 text-green-600">
              <CreditCard className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Total Payments</p>
              <p className="text-2xl font-bold tabular-nums">{payments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-100 text-blue-600">
              <CreditCard className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold tabular-nums">${totalAmount.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input ref={searchRef} value={searchValue}
              onChange={(e) => { setSearchValue(e.target.value); updateQuery("q", e.target.value); }}
              placeholder="Search by invoice or patient..."
              className="h-12 border bg-muted/50 pl-12 pr-12 text-base focus-visible:bg-background"
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
                <TableRow key={p.id}>
                  <TableCell className="px-5 py-4">
                    <Link href={`/billing/invoices/${p.invoiceId}`} className="font-mono font-semibold hover:underline">
                      {p.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="px-5 py-4">{p.patientName}</TableCell>
                  <TableCell className="px-5 py-4 font-bold">${parseFloat(p.amount).toFixed(2)}</TableCell>
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
