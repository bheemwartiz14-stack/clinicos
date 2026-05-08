import { AlertTriangle, Package, Pill, Plus } from "lucide-react";

const inventory = [
  ["Paracetamol 500mg", "2,400 units", "In stock"],
  ["Azithromycin", "180 units", "Expires soon"],
  ["Insulin Glargine", "74 units", "Low stock"],
  ["Surgical Gloves", "8,200 units", "In stock"],
];

export default function InventoryPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor medicines, supplies, stock levels, and expiry alerts.
          </p>
        </div>

        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          type="button"
        >
          <Plus className="size-4" />
          Add stock
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Items tracked", "342", Package],
          ["Medicines", "218", Pill],
          ["Stock alerts", "12", AlertTriangle],
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
          <h2 className="font-semibold text-foreground">Stock Overview</h2>
        </div>
        <div className="divide-y">
          {inventory.map(([item, quantity, status]) => (
            <div key={item} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-foreground">{item}</p>
                <p className="text-sm text-muted-foreground">{quantity}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
