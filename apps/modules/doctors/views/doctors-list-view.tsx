"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Edit,
  Eye,
  Plus,
  Search,
  Stethoscope,
  UserMinus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { addLeaveAction, addScheduleAction, createDoctorAction, deactivateDoctorAction, updateDoctorAction } from "../actions/doctor.actions";
import type { DoctorRecord } from "../services/doctor.service";
import { CheckboxField, FormField, SelectField, TextareaField } from "@/components/form-controls";
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

type Option = { id: string; name: string };
type Schedule = { id: string; dayOfWeek: number; startTime: string; endTime: string; slotDurationMinutes: number; isActive: boolean };
type Leave = { id: string; leaveDate: string; reason: string | null; isFullDay: boolean; startTime: string | null; endTime: string | null };
type Slot = { id: string; slotDate: string; startTime: string; endTime: string; isBooked: boolean; isBlocked: boolean };

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");
}

function avatarGradient(name: string) {
  const index = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function DoctorsListView({ doctors, generatedPassword }: { doctors: DoctorRecord[]; generatedPassword?: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState("");

  const activeFilter = searchParams.get("status") ?? "all";
  const query = searchParams.get("q")?.toLowerCase() ?? "";

  const filtered = doctors.filter((d) => {
    const matchesSearch = !query || d.name.toLowerCase().includes(query) || d.email.toLowerCase().includes(query) || (d.phone?.toLowerCase() ?? "").includes(query) || (d.specialtyName?.toLowerCase() ?? "").includes(query);
    const matchesFilter = activeFilter === "all" || (activeFilter === "active" && d.status === "active") || (activeFilter === "inactive" && d.status !== "active");
    return matchesSearch && matchesFilter;
  });

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
      router.push(`/doctors?${params.toString()}`);
    },
    [router, searchParams],
  );

  const total = doctors.length;
  const active = doctors.filter((d) => d.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">
            Medical Staff
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight">Doctor Management</h1>
          <p className="text-sm text-muted-foreground">Profiles, specialties, fees, schedules, and availability.</p>
        </div>
        <Button asChild>
          <Link href="/doctors/add">
            <Plus className="h-4 w-4" aria-hidden />
            Add Doctor
          </Link>
        </Button>
      </div>

      {generatedPassword ? (
        <Card className="border-0 shadow-sm border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Doctor created. Temporary password generated.</p>
              <p className="text-xs text-muted-foreground">Share this password with the doctor and ask them to change it after login.</p>
            </div>
            <code className="w-fit rounded-md border bg-background px-3 py-2 text-sm font-semibold">{generatedPassword}</code>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Doctors", value: total, icon: Users, color: "text-primary bg-primary/10" },
          { label: "Active", value: active, icon: UserRound, color: "text-emerald-600 bg-emerald-100" },
          { label: "Inactive", value: total - active, icon: Stethoscope, color: "text-amber-600 bg-amber-100" },
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
              placeholder="Search by name, email, phone, or specialty..."
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
                <TableHead className="w-[280px] px-5 py-4 font-semibold">Doctor</TableHead>
                <TableHead className="w-[160px] px-5 py-4 font-semibold">Specialty</TableHead>
                <TableHead className="w-[140px] px-5 py-4 font-semibold">Department</TableHead>
                <TableHead className="w-[90px] px-5 py-4 font-semibold">Fee</TableHead>
                <TableHead className="w-[120px] px-5 py-4 font-semibold">Status</TableHead>
                <TableHead className="w-[130px] px-5 py-4 text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((doctor) => (
                <TableRow key={doctor.id} className="group cursor-pointer">
                  <TableCell className="px-5 py-4">
                    <Link href={`/doctors/${doctor.id}`} className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm ${avatarGradient(doctor.name)}`}
                      >
                        {getInitials(doctor.name)}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-foreground">
                        {`Dr. ${doctor.name}`}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {doctor.email} · {doctor.phone ?? "No phone"}
                        </div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="text-sm">{doctor.specialtyName ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{doctor.qualification ?? ""}</div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-sm">
                    {doctor.departmentName ?? "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 font-medium tabular-nums">
                    ${doctor.consultationFee}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex flex-col gap-1.5">
                      <Badge
                        className={
                          doctor.status === "active"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : doctor.status === "inactive"
                              ? "border-gray-200 bg-gray-50 text-gray-500"
                              : "border-red-200 bg-red-50 text-red-700"
                        }
                      >
                        <span
                          className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                            doctor.status === "active" ? "bg-emerald-500" : doctor.status === "inactive" ? "bg-gray-400" : "bg-red-500"
                          }`}
                        />
                        {doctor.status}
                      </Badge>
                      {doctor.isAvailable ? (
                        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Available
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/doctors/${doctor.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/doctors/${doctor.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <form action={deactivateDoctorAction} className="inline-flex">
                        <input type="hidden" name="id" value={doctor.id} />
                        <Button type="submit" variant="ghost" size="sm" aria-label={`Deactivate ${doctor.name}`}>
                          <UserMinus className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          <span className="sr-only">Deactivate</span>
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-muted">
                <Stethoscope className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold">No doctors found</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {query || activeFilter !== "all"
                  ? "Try adjusting your search terms or filters."
                  : "Add your first doctor to get started."}
              </p>
              {!query && activeFilter === "all" && (
                <Button asChild className="mt-4">
                  <Link href="/doctors/add">
                    <Plus className="h-4 w-4" aria-hidden />
                    Add Doctor
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
              <span>
                Showing {filtered.length} of {total} doctor{total !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export function DoctorForm({ doctor, departments, specialties }: { doctor?: DoctorRecord | null; departments: Option[]; specialties: Option[] }) {
  const action = doctor ? updateDoctorAction.bind(null, doctor.id) : createDoctorAction;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">{doctor ? "Edit Doctor" : "Add Doctor"}</h1>
        <p className="text-sm text-muted-foreground">Manage profile, specialty, fees, and availability status.</p>
      </div>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Doctor Profile</CardTitle>
          <CardDescription>Doctor users automatically receive the Doctor role. Create can also generate Monday-Saturday schedules and slots.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="grid gap-4 md:grid-cols-2">
            <FormField label="First name" name="firstName" defaultValue={doctor?.firstName ?? ""} required />
            <FormField label="Last name" name="lastName" defaultValue={doctor?.lastName ?? ""} />
            <FormField label="Email" name="email" type="email" defaultValue={doctor?.email ?? ""} required />
            <FormField label="Phone" name="phone" defaultValue={doctor?.phone ?? ""} />
            {doctor ? <FormField label="New password (leave blank)" name="password" type="password" /> : null}
            <SelectField label="Department" name="departmentId" defaultValue={doctor?.departmentId ?? ""} options={[{ value: "", label: "No department" }, ...departments.map((item) => ({ value: item.id, label: item.name }))]} />
            <SelectField label="Specialty" name="specialtyId" defaultValue={doctor?.specialtyId ?? ""} options={[{ value: "", label: "No specialty" }, ...specialties.map((item) => ({ value: item.id, label: item.name }))]} />
            <FormField label="Qualification" name="qualification" defaultValue={doctor?.qualification ?? ""} />
            <FormField label="Experience years" name="experienceYears" type="number" min={0} defaultValue={doctor?.experienceYears ?? 0} />
            <FormField label="License number" name="licenseNumber" defaultValue={doctor?.licenseNumber ?? ""} />
            <FormField label="Consultation fee" name="consultationFee" type="number" step="0.01" min={0} defaultValue={doctor?.consultationFee ?? "0"} required />
            <SelectField label="Status" name="status" defaultValue={doctor?.status ?? "active"} options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }, { value: "blocked", label: "Blocked" }]} />
            <div className="flex items-end">
              <CheckboxField label="Available for appointments" name="isAvailable" defaultChecked={doctor?.isAvailable ?? true} />
            </div>
            <TextareaField label="Bio" name="bio" defaultValue={doctor?.bio ?? ""} className="md:col-span-2" rows={4} />
            {!doctor ? (
              <div className="grid gap-4 rounded-lg border bg-muted/25 p-4 md:col-span-2 md:grid-cols-3">
                <div className="md:col-span-3">
                  <CheckboxField label="Create initial schedule and generate slots now (Monday to Saturday)" name="createSchedule" defaultChecked />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {days.slice(1).map((day) => (
                      <Badge key={day} variant="outline">{day}</Badge>
                    ))}
                  </div>
                </div>
                <FormField label="Start time" name="scheduleStartTime" type="time" defaultValue="09:00" />
                <FormField label="End time" name="scheduleEndTime" type="time" defaultValue="17:00" />
                <FormField label="Slot minutes" name="scheduleSlotDurationMinutes" type="number" min={5} defaultValue={30} />
              </div>
            ) : null}
            <div className="flex items-end gap-2">
              <Button type="submit">{doctor ? "Save Doctor" : "Create Doctor"}</Button>
              <Button asChild variant="outline"><Link href="/doctors">Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function DoctorDetailView({ doctor, schedules, leaves, slots }: { doctor: DoctorRecord; schedules: Schedule[]; leaves: Leave[]; slots: Slot[] }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">{`Dr. ${doctor.name}`}</h1>
          <p className="text-sm text-muted-foreground">{doctor.specialtyName ?? "Doctor"} · Fee ${doctor.consultationFee}</p>
        </div>
        <Button asChild variant="outline"><Link href="/doctors">Back to Doctors</Link></Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Doctor Schedule</CardTitle>
            <CardDescription>Add weekly schedules to generate appointment slots.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={addScheduleAction} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="doctorId" value={doctor.id} />
              <SelectField label="Day" name="dayOfWeek" defaultValue="1" options={days.map((day, index) => ({ value: String(index), label: day }))} />
              <FormField label="Slot duration" name="slotDurationMinutes" type="number" defaultValue={30} min={5} />
              <FormField label="Start time" name="startTime" type="time" defaultValue="09:00" required />
              <FormField label="End time" name="endTime" type="time" defaultValue="17:00" required />
              <CheckboxField label="Active" name="isActive" defaultChecked />
              <Button type="submit">Add Schedule</Button>
            </form>
            <List items={schedules.map((item) => `${days[item.dayOfWeek]} ${item.startTime}-${item.endTime} (${item.slotDurationMinutes} min)`)} empty="No schedules yet." />
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Leave / Block Dates</CardTitle>
            <CardDescription>Block full or partial days from availability.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={addLeaveAction} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="doctorId" value={doctor.id} />
              <FormField label="Leave date" name="leaveDate" type="date" required />
              <FormField label="Reason" name="reason" />
              <FormField label="Start time" name="startTime" type="time" />
              <FormField label="End time" name="endTime" type="time" />
              <CheckboxField label="Full day" name="isFullDay" defaultChecked />
              <Button type="submit">Add Leave</Button>
            </form>
            <List items={leaves.map((item) => `${item.leaveDate} · ${item.isFullDay ? "Full day" : `${item.startTime}-${item.endTime}`} · ${item.reason ?? "No reason"}`)} empty="No leave dates." />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4" aria-hidden /> Available Appointment Slots</CardTitle>
          <CardDescription>Generated from active schedules for the next 14 days.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {slots.slice(0, 80).map((slot) => (
            <Badge key={slot.id} variant={slot.isBooked || slot.isBlocked ? "outline" : "default"}>{slot.slotDate} {slot.startTime}</Badge>
          ))}
          {slots.length === 0 ? <p className="text-sm text-muted-foreground">No slots generated yet. Add a schedule first.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function List({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return <div className="space-y-2">{items.map((item) => <div key={item} className="rounded-lg border p-2 text-sm">{item}</div>)}</div>;
}
