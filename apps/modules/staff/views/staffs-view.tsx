import Link from "next/link";
import { Plus, UserMinus, Users, BadgeCheck, UserRound, Shield, Building2, Mail, Phone, CalendarDays } from "lucide-react";
import { deactivateStaffAction, createStaffAction, updateStaffAction } from "../actions/staff.actions";
import { staffManageRoles, type StaffRecord } from "../services/staff.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormField, SelectField, TextareaField } from "@/components/form-controls";

type Department = { id: string; name: string };

const ROLE_COLORS: Record<string, string> = {
  admin: "border-purple-200 bg-purple-50 text-purple-700",
  receptionist: "border-blue-200 bg-blue-50 text-blue-700",
  accountant: "border-amber-200 bg-amber-50 text-amber-700",
};

const STATUS_BADGE: Record<string, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-gray-200 bg-gray-50 text-gray-500",
  blocked: "border-red-200 bg-red-50 text-red-700",
};

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");
}

const AVATAR_COLORS = [
  "from-blue-600 to-blue-400",
  "from-emerald-600 to-emerald-400",
  "from-violet-600 to-violet-400",
  "from-amber-600 to-amber-400",
  "from-rose-600 to-rose-400",
  "from-cyan-600 to-cyan-400",
];

function avatarGradient(name: string) {
  const index = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function StaffListView({ staff }: { staff: StaffRecord[] }) {
  const active = staff.filter((m) => m.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-6 rounded-full bg-primary/5" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">
              Staff Directory
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage Admin, Receptionist, and Accountant staff. Doctors are handled in Doctor Management.
            </p>
          </div>
          <Button asChild>
            <Link href="/settings/staff-manage/create">
              <Plus className="h-4 w-4" aria-hidden />
              Add Staff
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
              <Users className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="truncate text-sm text-muted-foreground">Total Staff</p>
              <p className="text-2xl font-bold tabular-nums">{staff.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 text-emerald-600">
              <BadgeCheck className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="truncate text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold tabular-nums">{active}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 text-amber-600">
              <UserRound className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="truncate text-sm text-muted-foreground">Inactive</p>
              <p className="text-2xl font-bold tabular-nums">{staff.length - active}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3">
        {staff.map((member) => (
          <Card key={member.id} className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-base font-bold text-white shadow-sm ring-2 ring-background ${avatarGradient(member.name)}`}>
                  {getInitials(member.name)}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold truncate">{member.name}</h2>
                    <Badge className={STATUS_BADGE[member.status] ?? "border-gray-200 bg-gray-50 text-gray-500"}>
                      <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${member.status === "active" ? "bg-emerald-500" : member.status === "blocked" ? "bg-red-500" : "bg-gray-400"}`} />
                      {member.status}
                    </Badge>
                    <Badge className={ROLE_COLORS[member.role] ?? "border-gray-200 bg-gray-50 text-gray-600"}>
                      {member.role}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{member.departmentName ?? "No department"}</span>
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{member.email}</span>
                    {member.designation && <span>· {member.designation}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
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
        {staff.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted mb-4">
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold">No staff found</h3>
            <p className="text-sm text-muted-foreground mt-1">Add your first staff member to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function StaffForm({ departments, staff }: { departments: Department[]; staff?: StaffRecord | null }) {
  const action = staff ? updateStaffAction.bind(null, staff.id) : createStaffAction;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-6 rounded-full bg-primary/5" />
        <div className="relative">
          <h1 className="text-2xl font-bold tracking-tight">{staff ? "Edit Staff" : "Add Staff"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create and update Admin, Receptionist, and Accountant profiles only.</p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-muted/10">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserRound className="h-4 w-4" />
            </span>
            <div>
              <CardTitle>Staff Profile</CardTitle>
              <CardDescription>These details create or update the staff user account.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form action={action} className="grid gap-5 md:grid-cols-2">
            <FormField label="First name" name="firstName" defaultValue={staff?.firstName ?? ""} required />
            <FormField label="Last name" name="lastName" defaultValue={staff?.lastName ?? ""} />
            <FormField label="Email" name="email" type="email" defaultValue={staff?.email ?? ""} required />
            <FormField label="Username" name="username" defaultValue={staff?.username ?? ""} />
            <FormField label="Phone" name="phone" defaultValue={staff?.phone ?? ""} />
            <FormField label={staff ? "New password (leave blank)" : "Password"} name="password" type="password" required={!staff} />
            <SelectField label="Role" name="role" defaultValue={staff?.role ?? "receptionist"} options={staffManageRoles.map((role) => ({ value: role, label: role }))} />
            <SelectField label="Department" name="departmentId" defaultValue={staff?.departmentId ?? ""} options={[{ value: "", label: "No department" }, ...departments.map((department) => ({ value: department.id, label: department.name }))]} />
            <FormField label="Employee code" name="employeeCode" defaultValue={staff?.employeeCode ?? ""} />
            <FormField label="Designation" name="designation" defaultValue={staff?.designation ?? ""} />
            <FormField label="Joining date" name="joiningDate" type="date" defaultValue={staff?.joiningDate ?? ""} />
            <FormField label="Emergency contact" name="emergencyContact" defaultValue={staff?.emergencyContact ?? ""} />
            <TextareaField label="Address" name="address" defaultValue={staff?.address ?? ""} className="md:col-span-2" rows={3} />
            <SelectField label="Status" name="status" defaultValue={staff?.status ?? "active"} options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }, { value: "blocked", label: "Blocked" }]} />
            <div className="flex items-end gap-2 md:col-span-2">
              <Button type="submit" size="lg">{staff ? "Save Staff" : "Create Staff"}</Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/settings/staff-manage">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
