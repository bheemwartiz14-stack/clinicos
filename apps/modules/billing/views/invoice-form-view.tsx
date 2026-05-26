"use client";

import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { createInvoiceAction } from "../actions/billing.actions";
import type { PatientRecord } from "@modules/patients/services/patient.service";
import { FormField, SelectField, TextareaField } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InvoiceForm({ patients }: { patients: PatientRecord[] }) {
  const [items, setItems] = useState([{ itemName: "", description: "", quantity: 1, unitPrice: "0" }]);

  const addItem = () => setItems((prev) => [...prev, { itemName: "", description: "", quantity: 1, unitPrice: "0" }]);
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));
  const updateItem = (index: number, field: string, value: string | number) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  const subtotal = items.reduce((sum, item) => sum + (parseFloat(String(item.unitPrice)) || 0) * (item.quantity || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create Invoice</h1>
        <p className="text-sm text-muted-foreground">Generate a new invoice for a patient.</p>
      </div>

      <form action={createInvoiceAction} className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>Select patient and add line items.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <SelectField
              label="Patient"
              name="patientId"
              required
              options={[
                { value: "", label: "Select patient" },
                ...patients.map((p) => ({ value: p.id, label: `${p.fullName} (${p.phone})` })),
              ]}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField label="GST %" name="gstPercent" type="number" min="0" max="100" step="0.01" defaultValue="0" />
              <FormField label="Discount %" name="discountPercent" type="number" min="0" max="100" step="0.01" defaultValue="0" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Line Items</CardTitle>
                <CardDescription>Add items or services to invoice.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/20 p-4">
                  <div className="flex-1 min-w-[200px]">
                    <Label className="text-xs font-medium">Item Name</Label>
                    <Input
                      name={`itemName`}
                      value={item.itemName}
                      onChange={(e) => updateItem(index, "itemName", e.target.value)}
                      placeholder="e.g. Consultation fee"
                      required
                    />
                  </div>
                  <div className="w-20">
                    <Label className="text-xs font-medium">Qty</Label>
                    <Input
                      name={`quantity`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="w-32">
                    <Label className="text-xs font-medium">Unit Price ($)</Label>
                    <Input
                      name={`unitPrice`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-24 text-right">
                    <Label className="text-xs font-medium">Total</Label>
                    <p className="pt-2 font-bold">${((parseFloat(String(item.unitPrice)) || 0) * (item.quantity || 0)).toFixed(2)}</p>
                  </div>
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <input type="hidden" name="description" value={item.description} />
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <span className="text-lg font-bold">Subtotal: ${subtotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" size="lg">Create Invoice</Button>
          <Button asChild variant="outline" size="lg"><Link href="/billing/invoices">Cancel</Link></Button>
        </div>
      </form>
    </div>
  );
}
