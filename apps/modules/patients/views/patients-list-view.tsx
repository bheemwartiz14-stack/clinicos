import Link from "next/link";
import { Calendar, FileText, Plus, Receipt, Search, Stethoscope, UserRound, Users } from "lucide-react";
import { createPatientAction, updatePatientAction } from "../actions/patient.actions";
import type { PatientMedicalHistoryRecord, PatientNoteRecord, PatientRecord } from "../services/patient.service";
import { FormField, SelectField, TextareaField } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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
  "bg-blue-600", "bg-emerald-600", "bg-violet-600", "bg-amber-600",
  "bg-rose-600", "bg-cyan-600", "bg-orange-600", "bg-pink-600"
];

function avatarColor(name: string) {
  const index = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function PatientsListView({ patients, q }: { patients: PatientRecord[]; q?: string }) {
  const total = patients.length;
  const active = patients.filter((p) => p.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="outline" className="mb-3">Patient Records</Badge>
          <h1 className="text-2xl font-semibold tracking-normal">Patient Management</h1>
          <p className="text-sm text-muted-foreground">Search, register, and manage patient profiles.</p>
        </div>
        <Button asChild size="lg">
          <Link href="/patients/create">
            <Plus className="h-4 w-4" aria-hidden />
            Register Patient
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-lg">
          <CardContent className="flex items-center gap-4 p-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardContent className="flex items-center gap-4 p-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
              <UserRound className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{active}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardContent className="flex items-center gap-4 p-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <Calendar className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Inactive</p>
              <p className="text-2xl font-bold">{total - active}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg">
        <CardContent className="p-4">
          <form className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Search by name, phone, or email..."
              defaultValue={q ?? ""}
              className="h-12 border-none bg-muted/50 pl-12 text-base focus-visible:ring-1 focus-visible:ring-primary/30"
            />
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-lg overflow-hidden border-0 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-semibold">Patient</th>
                <th className="px-5 py-4 font-semibold">Phone</th>
                <th className="px-5 py-4 font-semibold">Gender / DOB</th>
                <th className="px-5 py-4 font-semibold">Blood Group</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {patients.map((patient) => (
                <tr key={patient.id} className="transition hover:bg-muted/30 group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(patient.fullName)}`}>
                        {getInitials(patient.fullName)}
                      </span>
                      <div>
                        <div className="font-semibold text-foreground">{patient.fullName}</div>
                        <div className="text-xs text-muted-foreground">{patient.email ?? ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium">{patient.phone}</td>
                  <td className="px-5 py-4">
                    <div>{patient.gender ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{patient.dateOfBirth ?? ""}</div>
                  </td>
                  <td className="px-5 py-4">
                    {patient.bloodGroup ? (
                      <Badge variant="outline" className="font-mono">{patient.bloodGroup}</Badge>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      className={patient.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-gray-50 text-gray-500"}
                    >
                      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${patient.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                      {patient.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button asChild variant="outline" size="sm"><Link href={`/patients/${patient.id}`}>View</Link></Button>
                      <Button asChild variant="outline" size="sm"><Link href={`/patients/${patient.id}/edit`}>Edit</Link></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-muted">
                <Users className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold">No patients found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {q ? "Try adjusting your search terms." : "Register your first patient to get started."}
              </p>
              {!q && (
                <Button asChild className="mt-4">
                  <Link href="/patients/create">
                    <Plus className="h-4 w-4" aria-hidden />
                    Register Patient
                  </Link>
                </Button>
              )}
            </div>
          ) : null}
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
        <h1 className="text-2xl font-semibold tracking-normal">{patient ? "Edit Patient" : "Register Patient"}</h1>
        <p className="text-sm text-muted-foreground">Manage patient demographics, contact, and emergency details.</p>
      </div>
      <Card className="rounded-lg border-0 shadow-md">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>Quick patient registration with essential fields.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form action={action} className="grid gap-5 md:grid-cols-2">
            <FormField label="Full name" name="fullName" defaultValue={patient?.fullName ?? ""} required />
            <FormField label="Phone" name="phone" defaultValue={patient?.phone ?? ""} required />
            <FormField label="Email" name="email" type="email" defaultValue={patient?.email ?? ""} />
            <FormField label="Date of birth" name="dateOfBirth" type="date" defaultValue={patient?.dateOfBirth ?? ""} />
            <SelectField
              label="Gender"
              name="gender"
              defaultValue={patient?.gender ?? ""}
              options={[
                { value: "", label: "Select gender" },
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" }
              ]}
            />
            <SelectField
              label="Blood group"
              name="bloodGroup"
              defaultValue={patient?.bloodGroup ?? ""}
              options={[
                { value: "", label: "Select blood group" },
                ...bloodGroups.map((bg) => ({ value: bg, label: bg }))
              ]}
            />
            <TextareaField label="Address" name="address" defaultValue={patient?.address ?? ""} className="md:col-span-2" rows={3} />
            <FormField label="Emergency contact name" name="emergencyContactName" defaultValue={patient?.emergencyContactName ?? ""} />
            <FormField label="Emergency contact phone" name="emergencyContactPhone" defaultValue={patient?.emergencyContactPhone ?? ""} />
            <div className="flex items-end gap-2 md:col-span-2">
              <Button type="submit" size="lg">{patient ? "Save Patient" : "Register Patient"}</Button>
              <Button asChild variant="outline" size="lg"><Link href="/patients">Cancel</Link></Button>
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
  notes
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
            <span className={`flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg ${avatarColor(patient.fullName)}`}>
              {getInitials(patient.fullName)}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-normal">{patient.fullName}</h1>
                <Badge
                  className={patient.isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-gray-50 text-gray-500"}
                >
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${patient.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                  {patient.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{patient.phone} · {patient.email ?? "No email"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link href={`/patients/${patient.id}/edit`}>Edit Patient</Link></Button>
            <Button asChild variant="ghost"><Link href="/patients">Back to Patients</Link></Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="rounded-lg border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{appointmentHistory.length}</p>
            <p className="text-xs text-muted-foreground">Appointments</p>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{billingHistory.length}</p>
            <p className="text-xs text-muted-foreground">Invoices</p>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-violet-600">{medicalHistory.length}</p>
            <p className="text-xs text-muted-foreground">Conditions</p>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{notes.length}</p>
            <p className="text-xs text-muted-foreground">Notes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-lg border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-sm font-semibold">Demographics</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            <div className="flex justify-between px-5 py-3 text-sm"><span className="text-muted-foreground">Gender</span><span className="font-medium">{patient.gender ?? "—"}</span></div>
            <div className="flex justify-between px-5 py-3 text-sm"><span className="text-muted-foreground">Date of birth</span><span className="font-medium">{patient.dateOfBirth ?? "—"}</span></div>
            <div className="flex justify-between px-5 py-3 text-sm"><span className="text-muted-foreground">Blood group</span><span className="font-medium">{patient.bloodGroup ? <Badge variant="outline" className="font-mono">{patient.bloodGroup}</Badge> : "—"}</span></div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-sm font-semibold">Contact</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            <div className="flex justify-between px-5 py-3 text-sm"><span className="text-muted-foreground">Phone</span><span className="font-medium">{patient.phone}</span></div>
            <div className="flex justify-between px-5 py-3 text-sm"><span className="text-muted-foreground">Email</span><span className="font-medium">{patient.email ?? "—"}</span></div>
            <div className="flex justify-between px-5 py-3 text-sm"><span className="text-muted-foreground">Address</span><span className="max-w-[200px] text-right font-medium">{patient.address ?? "—"}</span></div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-sm font-semibold">Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            <div className="flex justify-between px-5 py-3 text-sm"><span className="text-muted-foreground">Name</span><span className="font-medium">{patient.emergencyContactName ?? "—"}</span></div>
            <div className="flex justify-between px-5 py-3 text-sm"><span className="text-muted-foreground">Phone</span><span className="font-medium">{patient.emergencyContactPhone ?? "—"}</span></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg border-0 shadow-sm">
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
                <p className="text-sm text-muted-foreground">No medical history recorded.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medicalHistory.map((item) => (
                  <div key={item.id} className="relative rounded-lg border-l-4 border-l-violet-500 bg-muted/20 p-4 pl-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{item.condition}</p>
                        {item.description ? <p className="mt-1 text-sm text-muted-foreground">{item.description}</p> : null}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{item.diagnosedAt ?? ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg border-0 shadow-sm">
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
                <p className="text-sm text-muted-foreground">No appointments recorded.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointmentHistory.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{item.appointmentDate}</span>
                        <span className="text-xs text-muted-foreground">{item.startTime}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.type.replace("_", " ")} · {item.reason ?? "General"}</p>
                    </div>
                    <Badge className={
                      item.status === "completed" ? "border-green-200 bg-green-50 text-green-700" :
                      item.status === "confirmed" ? "border-blue-200 bg-blue-50 text-blue-700" :
                      item.status === "cancelled" ? "border-red-200 bg-red-50 text-red-700" :
                      "border-gray-200 bg-gray-50 text-gray-600"
                    }>{item.status}</Badge>
                  </div>
                ))}
                {appointmentHistory.length > 5 && (
                  <p className="text-center text-xs text-muted-foreground">+ {appointmentHistory.length - 5} more</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg border-0 shadow-sm">
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
                <p className="text-sm text-muted-foreground">No billing records found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {billingHistory.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-semibold text-sm">{item.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">${item.totalAmount}</span>
                      <Badge className={
                        item.paymentStatus === "paid" ? "border-green-200 bg-green-50 text-green-700" :
                        item.paymentStatus === "pending" ? "border-yellow-200 bg-yellow-50 text-yellow-700" :
                        "border-red-200 bg-red-50 text-red-700"
                      }>{item.paymentStatus}</Badge>
                    </div>
                  </div>
                ))}
                {billingHistory.length > 5 && (
                  <p className="text-center text-xs text-muted-foreground">+ {billingHistory.length - 5} more</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg border-0 shadow-sm">
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
                <p className="text-sm text-muted-foreground">No notes recorded.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-lg border p-3">
                    <p className="text-sm">{item.note}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                {notes.length > 5 && (
                  <p className="text-center text-xs text-muted-foreground">+ {notes.length - 5} more</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
