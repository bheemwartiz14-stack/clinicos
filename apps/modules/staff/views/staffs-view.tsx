import Link from "next/link";
import type React from "react";
import { Plus, UserMinus } from "lucide-react";
import { deactivateStaffAction, createStaffAction, updateStaffAction } from "../actions/staff.actions";
import { staffManageRoles, type StaffRecord } from "../services/staff.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/form-controls";

type Department = { id: string; name: string };

export function StaffListView({ staff }: { staff: StaffRecord[] }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Staff Management</h1>
          <p className="text-sm text-muted-foreground">Manage Admin, Receptionist, and Accountant staff. Doctors are handled in Doctor Management.</p>
        </div>
        <Button asChild>
          <Link href="/settings/staff-manage/create">
            <Plus className="h-4 w-4" aria-hidden />
            Add Staff
          </Link>
        </Button>
      </div>

      <div className="grid gap-3">
        {staff.map((member) => (
          <Card key={member.id} className="rounded-lg">
            <CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{member.name}</h2>
                  <Badge variant={member.status === "active" ? "default" : "outline"}>{member.status}</Badge>
                  <Badge variant="outline">{member.role}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{member.designation ?? "Staff"} · {member.departmentName ?? "No department"} · {member.email}</p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/settings/staff-manage/${member.id}/edit`}>Edit</Link>
                </Button>
                <form action={deactivateStaffAction}>
                  <input type="hidden" name="id" value={member.id} />
                  <Button type="submit" variant="destructive" size="sm">
                    <UserMinus className="h-4 w-4" aria-hidden />
                    Deactivate
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
        {staff.length === 0 ? <Card className="rounded-lg"><CardContent className="py-8 text-sm text-muted-foreground">No staff found.</CardContent></Card> : null}
      </div>
    </div>
  );
}

export function StaffForm({ departments, staff }: { departments: Department[]; staff?: StaffRecord | null }) {
  const action = staff ? updateStaffAction.bind(null, staff.id) : createStaffAction;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">{staff ? "Edit Staff" : "Add Staff"}</h1>
        <p className="text-sm text-muted-foreground">Create and update Admin, Receptionist, and Accountant profiles only.</p>
      </div>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Staff Profile</CardTitle>
          <CardDescription>These details create or update the staff user account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="grid gap-4 md:grid-cols-2">
            <FormField label="First name" name="firstName" defaultValue={staff?.firstName ?? ""} required />
            <FormField label="Last name" name="lastName" defaultValue={staff?.lastName ?? ""} />
            <FormField label="Email" name="email" type="email" defaultValue={staff?.email ?? ""} required />
            <FormField label="Username" name="username" defaultValue={staff?.username ?? ""} />
            <FormField label="Phone" name="phone" defaultValue={staff?.phone ?? ""} />
            <FormField label={staff ? "New password (leave blank)" : "Password"} name="password" type="password" required={!staff} />
            <SelectField label="Role" name="role" defaultValue={staff?.role ?? "receptionist"} options={staffManageRoles.map((role) => [role, role])} />
            <SelectField label="Department" name="departmentId" defaultValue={staff?.departmentId ?? ""} options={[["", "No department"], ...departments.map((department) => [department.id, department.name] as const)]} />
            <FormField label="Employee code" name="employeeCode" defaultValue={staff?.employeeCode ?? ""} />
            <FormField label="Designation" name="designation" defaultValue={staff?.designation ?? ""} />
            <FormField label="Joining date" name="joiningDate" type="date" defaultValue={staff?.joiningDate ?? ""} />
            <FormField label="Emergency contact" name="emergencyContact" defaultValue={staff?.emergencyContact ?? ""} />
            <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
              <span>Address</span>
              <textarea name="address" defaultValue={staff?.address ?? ""} className="min-h-20 rounded-lg border bg-background px-3 py-2 text-sm" />
            </label>
            <SelectField label="Status" name="status" defaultValue={staff?.status ?? "active"} options={[["active", "Active"], ["inactive", "Inactive"], ["blocked", "Blocked"]]} />
            <div className="flex items-end gap-2">
              <Button type="submit">{staff ? "Save Staff" : "Create Staff"}</Button>
              <Button asChild variant="outline">
                <Link href="/settings/staff-manage">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: ReadonlyArray<readonly [string, string]> }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
        {options.map(([value, label]) => <option key={value || "empty"} value={value}>{label}</option>)}
      </select>
    </label>
  );
}
