"use client";

import { upsertPayoutSettingAction } from "../actions/payroll.actions";
import type { DoctorPayoutSettingRecord } from "../services/payroll.service";
import { FormField, SelectField } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type DoctorOption = { id: string; name: string };

export function DoctorsPayoutView({
  settings,
  doctors,
}: {
  settings: DoctorPayoutSettingRecord[];
  doctors: DoctorOption[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Doctor Payout Settings</h1>
        <p className="text-sm text-muted-foreground">Configure salary and commission structures for doctors.</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle>Add / Edit Payout Setting</CardTitle>
          <CardDescription>Select a doctor and configure their payout structure.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form action={upsertPayoutSettingAction} className="grid gap-4 md:grid-cols-2">
            <SelectField label="Doctor" name="doctorId" required
              options={[
                { value: "", label: "Select doctor" },
                ...doctors.map((d) => ({ value: d.id, label: d.name })),
              ]}
            />
            <SelectField label="Salary Type" name="salaryType" defaultValue="commission"
              options={[
                { value: "fixed", label: "Fixed Salary" },
                { value: "commission", label: "Commission Only" },
                { value: "fixed_plus_commission", label: "Fixed + Commission" },
              ]}
            />
            <FormField label="Fixed Salary ($)" name="fixedSalary" type="number" step="0.01" min="0" defaultValue="0" />
            <FormField label="Commission Percentage (%)" name="commissionPercentage" type="number" step="0.01" min="0" max="100" defaultValue="0" />
            <div className="md:col-span-2">
              <Button type="submit">Save Setting</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle>Current Settings</CardTitle>
          <CardDescription>Existing payout configurations for doctors.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Doctor</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Fixed Salary</th>
                <th className="px-4 py-3 font-semibold">Commission %</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {settings.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium">{s.doctorName}</td>
                  <td className="px-4 py-3 capitalize">{s.salaryType.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">${parseFloat(s.fixedSalary).toFixed(2)}</td>
                  <td className="px-4 py-3">{s.commissionPercentage}%</td>
                  <td className="px-4 py-3">
                    <Badge variant={s.isActive ? "default" : "outline"}>{s.isActive ? "Active" : "Inactive"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {settings.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No payout settings configured yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
