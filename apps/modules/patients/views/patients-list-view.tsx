"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Edit,
  Eye,
  FileText,
  Plus,
  Receipt,
  Search,
  SlidersHorizontal,
  Stethoscope,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { createPatientAction, updatePatientAction } from "../actions/patient.actions";
import type { PatientMedicalHistoryRecord, PatientNoteRecord, PatientRecord } from "../services/patient.service";
import { FormField, SelectField, TextareaField } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

type AppointmentRecord = {
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string | null;
  type: string;
  status: string;
  reason: string | null;
};

type InvoiceRecord = {
  id: string;
  invoiceNumber: string;
  totalAmount: string;
  paymentStatus: string;
  createdAt: Date;
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
  "from-orange-600 to-orange-400",
  "from-pink-600 to-pink-400",
];

function avatarGradient(name: string) {
  const index = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function PatientsListView({
  patients,
  q,
  status,
}: {
  patients: PatientRecord[];
  q?: string;
  status?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState(q ?? "");

  const activeFilter = status ?? "all";
  const filtered =
    activeFilter === "active"
      ? patients.filter((p) => p.isActive)
      : activeFilter === "inactive"
        ? patients.filter((p) => !p.isActive)
        : patients;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const updateQuery = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`/patients?${params.toString()}`);
    },
    [router, searchParams],
  );

  const total = patients.length;
  const active = patients.filter((p) => p.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">
            Patient Records
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight">Patient Management</h1>
          <p className="text-sm text-muted-foreground">
            Search, register, and manage patient profiles.
          </p>
        </div>
        <Button asChild>
          <Link href="/patients/create">
            <Plus className="h-4 w-4" aria-hidden />
            Register Patient
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Patients", value: total, icon: Users, color: "text-primary bg-primary/10" },
          { label: "Active", value: active, icon: UserRound, color: "text-emerald-600 bg-emerald-100" },
          { label: "Inactive", value: total - active, icon: Calendar, color: "text-amber-600 bg-amber-100" },
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
              onChange={(e) => {
                setSearchValue(e.target.value);
                updateQuery("q", e.target.value);
              }}
              placeholder="Search by name, phone, or email...  "
              className="h-12 border bg-muted/50 pl-12 pr-12 text-base focus-visible:bg-background"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => {
                  setSearchValue("");
                  updateQuery("q", "");
                  searchRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
              {navigator.platform?.includes("Mac") ? "⌘" : "Ctrl"}K
            </kbd>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "inactive", label: "Inactive" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => updateQuery("status", tab.key === "all" ? "" : tab.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  activeFilter === tab.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tab.label}
                {tab.key === "active" && (
                  <span className="tabular-nums">({active})</span>
                )}
                {tab.key === "inactive" && (
                  <span className="tabular-nums">({total - active})</span>
                )}
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
                <TableHead className="w-[280px] px-5 py-4 font-semibold">Patient</TableHead>
                <TableHead className="w-[150px] px-5 py-4 font-semibold">Phone</TableHead>
                <TableHead className="w-[140px] px-5 py-4 font-semibold">Gender / DOB</TableHead>
                <TableHead className="w-[110px] px-5 py-4 font-semibold">Blood Group</TableHead>
                <TableHead className="w-[90px] px-5 py-4 font-semibold">Status</TableHead>
                <TableHead className="w-[130px] px-5 py-4 text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((patient) => (
                <TableRow key={patient.id} className="group cursor-pointer">
                  <TableCell className="px-5 py-4">
                    <Link href={`/patients/${patient.id}`} className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm ${avatarGradient(patient.fullName)}`}
                      >
                        {getInitials(patient.fullName)}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-foreground">
                          {patient.fullName}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {patient.email ?? "No email"}
                        </div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="px-5 py-4 font-medium tabular-nums">
                    {patient.phone}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="text-sm">{patient.gender ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {patient.dateOfBirth ?? ""}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    {patient.bloodGroup ? (
                      <Badge
                        variant="outline"
                        className="border-primary/20 bg-primary/5 font-mono text-xs"
                      >
                        {patient.bloodGroup}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge
                      className={
                        patient.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 bg-gray-50 text-gray-500"
                      }
                    >
                      <span
                        className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                          patient.isActive ? "bg-emerald-500" : "bg-gray-400"
                        }`}
                      />
                      {patient.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/patients/${patient.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/patients/${patient.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-muted">
                <Users className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold">No patients found</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {q || activeFilter !== "all"
                  ? "Try adjusting your search terms or filters."
                  : "Register your first patient to get started."}
              </p>
              {!q && activeFilter === "all" && (
                <Button asChild className="mt-4">
                  <Link href="/patients/create">
                    <Plus className="h-4 w-4" aria-hidden />
                    Register Patient
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
              <span>
                Showing {filtered.length} of {total} patient{total !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export function PatientForm({ patient }: { patient?: PatientRecord | null }) {
  const action = patient ? updatePatientAction.bind(null, patient.id) : createPatientAction;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {patient ? "Edit Patient" : "Register Patient"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage patient demographics, contact, and emergency details.
        </p>
      </div>
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>
            Quick patient registration with essential fields.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form action={action} className="grid gap-5 md:grid-cols-2">
            <FormField
              label="Full name"
              name="fullName"
              defaultValue={patient?.fullName ?? ""}
              required
            />
            <FormField
              label="Phone"
              name="phone"
              defaultValue={patient?.phone ?? ""}
              required
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              defaultValue={patient?.email ?? ""}
            />
            <FormField
              label="Date of birth"
              name="dateOfBirth"
              type="date"
              defaultValue={patient?.dateOfBirth ?? ""}
            />
            <SelectField
              label="Gender"
              name="gender"
              defaultValue={patient?.gender ?? ""}
              options={[
                { value: "", label: "Select gender" },
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
              ]}
            />
            <SelectField
              label="Blood group"
              name="bloodGroup"
              defaultValue={patient?.bloodGroup ?? ""}
              options={[
                { value: "", label: "Select blood group" },
                ...bloodGroups.map((bg) => ({ value: bg, label: bg })),
              ]}
            />
            <TextareaField
              label="Address"
              name="address"
              defaultValue={patient?.address ?? ""}
              className="md:col-span-2"
              rows={3}
            />
            <FormField
              label="Emergency contact name"
              name="emergencyContactName"
              defaultValue={patient?.emergencyContactName ?? ""}
            />
            <FormField
              label="Emergency contact phone"
              name="emergencyContactPhone"
              defaultValue={patient?.emergencyContactPhone ?? ""}
            />
            <div className="flex items-end gap-2 md:col-span-2">
              <Button type="submit" size="lg">
                {patient ? "Save Patient" : "Register Patient"}
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/patients">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function PatientDetailView({
  patient,
  medicalHistory,
  appointmentHistory,
  billingHistory,
  notes,
}: {
  patient: PatientRecord;
  medicalHistory: PatientMedicalHistoryRecord[];
  appointmentHistory: AppointmentRecord[];
  billingHistory: InvoiceRecord[];
  notes: PatientNoteRecord[];
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-gradient-to-r from-primary/5 via-transparent to-transparent p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-lg font-bold text-white shadow-lg ${avatarGradient(patient.fullName)}`}
            >
              {getInitials(patient.fullName)}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {patient.fullName}
                </h1>
                <Badge
                  className={
                    patient.isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 bg-gray-50 text-gray-500"
                  }
                >
                  <span
                    className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                      patient.isActive ? "bg-emerald-500" : "bg-gray-400"
                    }`}
                  />
                  {patient.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {patient.phone} · {patient.email ?? "No email"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/patients/${patient.id}/edit`}>Edit Patient</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/patients">Back to Patients</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Appointments", value: appointmentHistory.length, color: "text-primary" },
          { label: "Invoices", value: billingHistory.length, color: "text-emerald-600" },
          { label: "Conditions", value: medicalHistory.length, color: "text-violet-600" },
          { label: "Notes", value: notes.length, color: "text-amber-600" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-sm font-semibold">Demographics</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {[
              { label: "Gender", value: patient.gender ?? "—" },
              { label: "Date of birth", value: patient.dateOfBirth ?? "—" },
              {
                label: "Blood group",
                value: patient.bloodGroup ? (
                  <Badge variant="outline" className="font-mono">
                    {patient.bloodGroup}
                  </Badge>
                ) : (
                  "—"
                ),
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-5 py-3 text-sm"
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium">{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-sm font-semibold">Contact</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {[
              { label: "Phone", value: patient.phone },
              { label: "Email", value: patient.email ?? "—" },
              { label: "Address", value: patient.address ?? "—" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-5 py-3 text-sm"
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span className="max-w-[200px] truncate text-right font-medium">
                  {row.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-sm font-semibold">Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {[
              { label: "Name", value: patient.emergencyContactName ?? "—" },
              { label: "Phone", value: patient.emergencyContactPhone ?? "—" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-5 py-3 text-sm"
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium">{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Stethoscope className="h-4 w-4 text-primary" />
              Medical History
            </CardTitle>
            <CardDescription>Recorded conditions and diagnoses.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            {medicalHistory.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Stethoscope className="mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No medical history recorded.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {medicalHistory.map((item) => (
                  <div
                    key={item.id}
                    className="relative rounded-lg border-l-4 border-l-violet-500 bg-muted/20 p-4 pl-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold">{item.condition}</p>
                        {item.description ? (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {item.diagnosedAt ?? ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Calendar className="h-4 w-4 text-emerald-600" />
              Appointment History
            </CardTitle>
            <CardDescription>Past and upcoming appointments.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            {appointmentHistory.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Calendar className="mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No appointments recorded.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointmentHistory.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {item.appointmentDate}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.startTime}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {item.type.replace("_", " ")} · {item.reason ?? "General"}
                      </p>
                    </div>
                    <Badge
                      className={
                        item.status === "completed"
                          ? "shrink-0 border-green-200 bg-green-50 text-green-700"
                          : item.status === "confirmed"
                            ? "shrink-0 border-blue-200 bg-blue-50 text-blue-700"
                            : item.status === "cancelled"
                              ? "shrink-0 border-red-200 bg-red-50 text-red-700"
                              : "shrink-0 border-gray-200 bg-gray-50 text-gray-600"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
                {appointmentHistory.length > 5 && (
                  <p className="text-center text-xs text-muted-foreground">
                    + {appointmentHistory.length - 5} more
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Receipt className="h-4 w-4 text-amber-600" />
              Billing History
            </CardTitle>
            <CardDescription>Invoices and payment status.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            {billingHistory.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Receipt className="mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No billing records found.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {billingHistory.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{item.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-bold tabular-nums">
                        ${item.totalAmount}
                      </span>
                      <Badge
                        className={
                          item.paymentStatus === "paid"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : item.paymentStatus === "pending"
                              ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                              : "border-red-200 bg-red-50 text-red-700"
                        }
                      >
                        {item.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
                {billingHistory.length > 5 && (
                  <p className="text-center text-xs text-muted-foreground">
                    + {billingHistory.length - 5} more
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-violet-600" />
              Patient Notes
            </CardTitle>
            <CardDescription>Clinical notes and observations.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            {notes.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <FileText className="mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No notes recorded.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-lg border p-3">
                    <p className="text-sm">{item.note}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}{" "}
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                {notes.length > 5 && (
                  <p className="text-center text-xs text-muted-foreground">
                    + {notes.length - 5} more
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
