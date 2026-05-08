import { CreditCard, FileText, IndianRupee, Plus } from "lucide-react";

const invoices = [
  ["INV-2026-0042", "Priya Raman", "₹4,200", "Paid"],
  ["INV-2026-0043", "Arjun Sinha", "₹2,850", "Pending"],
  ["INV-2026-0044", "Meera Iyer", "₹1,600", "Draft"],
  ["INV-2026-0045", "Anita Verma", "₹6,300", "Paid"],
];

export default function BillingPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage invoices, payments, and clinic revenue.
          </p>
        </div>

        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          type="button"
        >
          <Plus className="size-4" />
          Create invoice
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Monthly revenue", "₹18.4L", IndianRupee],
          ["Paid invoices", "128", CreditCard],
          ["Pending bills", "21", FileText],
        ].map(([label, value, Icon]) => (
          <div key={label as string} className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label as string}</p>
              <Icon className="size-5 text-primary" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-foreground">{value as string}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold text-foreground">Recent Invoices</h2>
        </div>
        <div className="divide-y">
          {invoices.map(([invoice, patient, amount, status]) => (
            <div key={invoice} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-foreground">{invoice}</p>
                <p className="text-sm text-muted-foreground">{patient}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{amount}</p>
                <p className="text-xs text-muted-foreground">{status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
