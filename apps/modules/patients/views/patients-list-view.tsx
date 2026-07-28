"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  CalendarDays,
  Clock,
  Edit,
  Eye,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Receipt,
  Search,
  Shield,
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
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform?.includes("Mac") ?? false);
  }, []);

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
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-6 rounded-full bg-primary/5" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">
              Patient Records
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight">Patient Management</h1>
            <p className="text-sm text-muted-foreground">
              Search, register, and manage patient profiles.
            </p>
          </div>
          <Button asChild>
            <Link href="/patients/create">
              <Plus className="h-4 w-4" aria-hidden />
              Add Patient
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Patients", value: total, icon: Users, color: "from-primary/10 to-primary/5 text-primary" },
          { label: "Active", value: active, icon: UserRound, color: "from-emerald-500/10 to-emerald-500/5 text-emerald-600" },
          { label: "Inactive", value: total - active, icon: CalendarDays, color: "from-amber-500/10 to-amber-500/5 text-amber-600" },
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
              placeholder="Search by name, phone, or email..."
              className="h-12 border bg-muted/50 pl-12 pr-16 text-base focus-visible:bg-background"
            />
            {searchValue ? (
              <button
                type="button"
                onClick={() => {
                  setSearchValue("");
                  updateQuery("q", "");
                  searchRef.current?.focus();
                }}
                className="absolute right-12 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
              {isMac ? "⌘" : "Ctrl"}K
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
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
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

      <Card className="overflow-hidden border shadow-sm">
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
                <TableRow key={patient.id} className="group cursor-pointer transition-colors hover:bg-muted/20">
                  <TableCell className="px-5 py-4">
                    <Link href={`/patients/${patient.id}`} className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-sm ring-2 ring-background transition-transform group-hover:scale-110 ${avatarGradient(patient.fullName)}`}
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
              {!q && activeFilter === "all" && (
                <Button asChild className="mt-4">
                  <Link href="/patients/create">
                    <Plus className="h-4 w-4" aria-hidden />
                    Add Patient
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
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-6 rounded-full bg-primary/5" />
        <div className="relative">
          <h1 className="text-2xl font-bold tracking-tight">
            {patient ? "Edit Patient" : "Add Patient"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage patient demographics, contact, and emergency details.
          </p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-muted/10">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserRound className="h-4 w-4" />
            </span>
            <div>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>
                Quick patient registration with essential fields.
              </CardDescription>
            </div>
          </div>
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
                {patient ? "Save Patient" : "Add Patient"}
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

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; color: string }) {
  return (
    <Card className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <CardContent className="flex items-center gap-4 p-5">
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </span>
        <div>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const STATUS_BADGE: Record<string, string> = {
  completed: "border-green-200 bg-green-50 text-green-700",
  confirmed: "border-blue-200 bg-blue-50 text-blue-700",
  checked_in: "border-cyan-200 bg-cyan-50 text-cyan-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
  no_show: "border-gray-200 bg-gray-50 text-gray-600",
  pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
  booked: "border-violet-200 bg-violet-50 text-violet-700",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_BADGE[status] ?? "border-gray-200 bg-gray-50 text-gray-600";
  return <Badge className={`shrink-0 ${cls}`}>{status.replace(/_/g, " ")}</Badge>;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-muted/20">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground min-w-[90px]">{label}</span>
      <span className="font-medium ml-auto text-right">{value}</span>
    </div>
  );
}

export function PatientDetailView({
  patient,
  medicalHistory,
  appointmentHistory,
  billingHistory,
  notes,
  documents = [],
}: {
  patient: PatientRecord;
  medicalHistory: PatientMedicalHistoryRecord[];
  appointmentHistory: AppointmentRecord[];
  billingHistory: InvoiceRecord[];
  notes: PatientNoteRecord[];
  documents?: Array<{ id: string; title: string; fileUrl: string; fileType: string | null; fileSize: number | null; categoryName: string | null; createdAt: Date }>;
}) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "medical", label: `Medical (${medicalHistory.length})` },
    { id: "appointments", label: `Appointments (${appointmentHistory.length})` },
    { id: "billing", label: `Billing (${billingHistory.length})` },
    { id: "documents", label: `Documents (${documents.length})` },
    { id: "notes", label: `Notes (${notes.length})` },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-6 rounded-full bg-primary/5" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-5">
            <span className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-bold text-white shadow-lg ring-4 ring-background ${avatarGradient(patient.fullName)}`}>
              {getInitials(patient.fullName)}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{patient.fullName}</h1>
                <Badge className={
                  patient.isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }>
                  <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${patient.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                  {patient.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{patient.phone}</span>
                {patient.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{patient.email}</span>}
                {patient.bloodGroup && <Badge variant="outline" className="font-mono text-[11px]">{patient.bloodGroup}</Badge>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="default" size="sm">
              <Link href={`/patients/${patient.id}/edit`}><Edit className="h-3.5 w-3.5 mr-1" />Edit</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/patients">Back</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={CalendarDays} label="Appointments" value={appointmentHistory.length} color="bg-primary" />
        <StatCard icon={Receipt} label="Invoices" value={billingHistory.length} color="bg-emerald-500" />
        <StatCard icon={Shield} label="Conditions" value={medicalHistory.length} color="bg-violet-500" />
        <StatCard icon={FileText} label="Notes" value={notes.length} color="bg-amber-500" />
      </div>

      <div className="border-b">
        <div className="flex gap-0 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border shadow-sm">
            <CardHeader className="border-b bg-muted/10 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserRound className="h-4 w-4 text-primary" />
                Demographics
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y p-0">
              <InfoRow icon={UserRound} label="Gender" value={patient.gender ?? "—"} />
              <InfoRow icon={Calendar} label="DOB" value={patient.dateOfBirth ?? "—"} />
              <InfoRow icon={Shield} label="Blood" value={patient.bloodGroup ? <Badge variant="outline" className="font-mono">{patient.bloodGroup}</Badge> : "—"} />
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="border-b bg-muted/10 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y p-0">
              <InfoRow icon={Phone} label="Phone" value={patient.phone} />
              <InfoRow icon={Mail} label="Email" value={patient.email ?? "—"} />
              <InfoRow icon={MapPin} label="Address" value={patient.address ?? "—"} />
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="border-b bg-muted/10 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y p-0">
              <InfoRow icon={UserRound} label="Name" value={patient.emergencyContactName ?? "—"} />
              <InfoRow icon={Phone} label="Phone" value={patient.emergencyContactPhone ?? "—"} />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "medical" && (
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-muted/10">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Shield className="h-4 w-4 text-violet-500" />
              Medical History
            </CardTitle>
            <CardDescription>Recorded conditions and diagnoses.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            {medicalHistory.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <Shield className="mb-3 h-10 w-10 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">No medical history recorded.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medicalHistory.map((item) => (
                  <div key={item.id} className="relative rounded-xl border-l-4 border-l-violet-500 bg-muted/15 p-4 transition-colors hover:bg-muted/25">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{item.condition}</p>
                        {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
                      </div>
                      {item.diagnosedAt && (
                        <span className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />{item.diagnosedAt}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "appointments" && (
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-muted/10">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <CalendarDays className="h-4 w-4 text-emerald-500" />
              Appointment History
            </CardTitle>
            <CardDescription>Past and upcoming appointments.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {appointmentHistory.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">No appointments recorded.</p>
              </div>
            ) : (
              <div className="divide-y">
                {appointmentHistory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-muted/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted/20">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{item.appointmentDate}</span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />{item.startTime}
                          </span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground mt-0.5">
                          {item.type.replace(/_/g, " ")}{item.reason ? ` · ${item.reason}` : ""}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "billing" && (
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-muted/10">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Receipt className="h-4 w-4 text-amber-500" />
              Billing History
            </CardTitle>
            <CardDescription>Invoices and payment status.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {billingHistory.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <Receipt className="mb-3 h-10 w-10 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">No billing records found.</p>
              </div>
            ) : (
              <div className="divide-y">
                {billingHistory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-muted/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted/20">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{item.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-bold tabular-nums text-sm">${item.totalAmount}</span>
                      <StatusBadge status={item.paymentStatus} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "documents" && (
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-muted/10">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-blue-500" />
              Patient Documents
            </CardTitle>
            <CardDescription>Uploaded reports, images, and records.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {documents.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <FileText className="mb-3 h-10 w-10 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">No documents uploaded.</p>
              </div>
            ) : (
              <div className="divide-y">
                {documents.map((doc) => {
                  const isImage = doc.fileType?.startsWith("image/");
                  const icon = isImage ? "🖼" : "📄";
                  const ext = doc.fileUrl.split(".").pop()?.toUpperCase() ?? "FILE";
                  const size = doc.fileSize ? (doc.fileSize / 1024 / 1024).toFixed(1) + " MB" : "";
                  return (
                    <div key={doc.id} className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-muted/10">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted/20 text-lg">
                          {icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{doc.title}</p>
                          <p className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span className="font-mono uppercase text-[10px]">{ext}</span>
                            {size && <span>{size}</span>}
                            {doc.categoryName && <span>· {doc.categoryName}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(doc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">View</a>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "notes" && (
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-muted/10">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-violet-500" />
              Patient Notes
            </CardTitle>
            <CardDescription>Clinical notes and observations.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            {notes.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <FileText className="mb-3 h-10 w-10 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">No notes recorded.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((item) => (
                  <div key={item.id} className="rounded-xl border bg-muted/10 p-4 transition-colors hover:bg-muted/20">
                    <p className="text-sm leading-relaxed">{item.note}</p>
                    <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
