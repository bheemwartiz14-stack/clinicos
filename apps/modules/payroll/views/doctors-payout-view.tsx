"use client";

import { DollarSign, Stethoscope, Settings2 } from "lucide-react";
import { upsertPayoutSettingAction } from "../actions/payroll.actions";
import type { DoctorPayoutSettingRecord } from "../services/payroll.service";
import { FormField, SelectField } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-6 rounded-full bg-primary/5" />
        <div className="relative">
          <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">Payroll</Badge>
          <h1 className="text-2xl font-bold tracking-tight">Doctor Payout Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configure salary and commission structures for doctors.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Configured Doctors", value: settings.length, icon: Stethoscope, color: "from-primary/10 to-primary/5 text-primary" },
          { label: "Total Doctors", value: doctors.length, icon: DollarSign, color: "from-blue-500/10 to-blue-500/5 text-blue-600" },
          { label: "Pending Setup", value: doctors.length - settings.length, icon: Settings2, color: "from-amber-500/10 to-amber-500/5 text-amber-600" },
        ].map((stat) => (
          <Card key={stat.label} className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <CardContent className="flex items-center gap-4 p-5">
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-muted/10">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Settings2 className="h-4 w-4" />
            </span>
            <div>
              <CardTitle>Add / Edit Payout Setting</CardTitle>
              <CardDescription>Select a doctor and configure their payout structure.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form action={upsertPayoutSettingAction} className="grid gap-5 md:grid-cols-2">
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
              <Button type="submit" size="lg">Save Setting</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="border-b bg-muted/10">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <DollarSign className="h-4 w-4 text-primary" />
            Current Settings
          </CardTitle>
          <CardDescription>Existing payout configurations for doctors.</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="px-5 py-4 font-semibold">Doctor</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Type</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Fixed Salary</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Commission %</TableHead>
                <TableHead className="px-5 py-4 font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.map((s) => (
                <TableRow key={s.id} className="transition-colors hover:bg-muted/10">
                  <TableCell className="px-5 py-4 font-medium">{s.doctorName}</TableCell>
                  <TableCell className="px-5 py-4 capitalize text-sm">{s.salaryType.replace(/_/g, " ")}</TableCell>
                  <TableCell className="px-5 py-4 tabular-nums">${parseFloat(s.fixedSalary).toFixed(2)}</TableCell>
                  <TableCell className="px-5 py-4 tabular-nums">{s.commissionPercentage}%</TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge className={s.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}>
                      <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${s.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                      {s.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {settings.length === 0 && (
            <div className="flex flex-col items-center px-4 py-12 text-center">
              <DollarSign className="mb-3 h-8 w-8 text-muted-foreground/50" />
              <h3 className="text-sm font-semibold">No payout settings configured</h3>
              <p className="text-xs text-muted-foreground mt-1">Configure a doctor above to get started.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
