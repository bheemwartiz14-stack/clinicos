"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, CircleSlash, Clock, ListTodo, Plus, Search, Timer, User, XCircle } from "lucide-react";
import { Fragment, useCallback, useMemo, useRef, useState } from "react";
import { createAppointmentAction } from "../actions/appointment.actions";
import type { AppointmentRecord, AvailableSlot, DoctorOption } from "../types/appointment.types";
import { FormField, SelectField, TextareaField } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@mediclinic/ui";

const STATUS_CONFIG = {
  booked: { label: "Booked", dot: "bg-slate-500", badge: "border-slate-200 bg-slate-50 text-slate-700" },
  confirmed: { label: "Confirmed", dot: "bg-emerald-500", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  checked_in: { label: "Checked in", dot: "bg-blue-500", badge: "border-blue-200 bg-blue-50 text-blue-700" },
  in_consultation: { label: "In consultation", dot: "bg-amber-500", badge: "border-amber-200 bg-amber-50 text-amber-700" },
  completed: { label: "Completed", dot: "bg-green-600", badge: "border-green-200 bg-green-50 text-green-700" },
  cancelled: { label: "Cancelled", dot: "bg-red-500", badge: "border-red-200 bg-red-50 text-red-700" },
  rescheduled: { label: "Rescheduled", dot: "bg-orange-500", badge: "border-orange-200 bg-orange-50 text-orange-700" },
  no_show: { label: "No show", dot: "bg-gray-400", badge: "border-gray-200 bg-gray-50 text-gray-600" },
  pending: { label: "Pending", dot: "bg-yellow-500", badge: "border-yellow-200 bg-yellow-50 text-yellow-700" },
};

const STATUS_GROUPS = [
  { label: "Confirmed", value: "confirmed" },
  { label: "Checked-in", value: "checked_in" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "No Show", value: "no_show" },
];

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");
}

function getDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function computeHours(slots: AvailableSlot[]): string[] {
  const hours = new Set<string>();
  for (const slot of slots) {
    hours.add(slot.startTime.slice(0, 2));
  }
  if (hours.size === 0) {
    return Array.from({ length: 10 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);
  }
  return Array.from(hours).sort().map((h) => `${h}:00`);
}

function getCurrentTimeRounded() {
  const now = new Date();
  const minutes = now.getMinutes();
  const rounded = Math.ceil(minutes / 30) * 30;
  now.setMinutes(rounded, 0, 0);
  return now.toTimeString().slice(0, 5);
}

function isTimeInPast(date: string, time: string): boolean {
  if (date !== getDateString(new Date())) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m < currentMinutes;
}

function getCurrentTime() {
  return new Date().toTimeString().slice(0, 5);
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
  return <Badge className={`shrink-0 ${cfg.badge}`}>{cfg.label}</Badge>;
}

export function AppointmentsCalendarView({
  appointments,
  doctors,
  currentDate,
  slots,
}: {
  appointments: AppointmentRecord[];
  doctors: DoctorOption[];
  currentDate: string;
  slots: AvailableSlot[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();


  const selectedDoctorId = searchParams.get("doctorId") || "";
  const currentDateObj = new Date(currentDate + "T12:00:00");
  const isToday = getDateString(new Date()) === currentDate;

  const dayAppointments = useMemo(
    () => appointments.filter((a) => a.appointmentDate === currentDate),
    [appointments, currentDate]
  );

  const filteredDoctors = useMemo(
    () => doctors.filter((d) => !selectedDoctorId || d.id === selectedDoctorId),
    [doctors, selectedDoctorId]
  );

  const slotsByDoctorAndHour = useMemo(() => {
    const map: Record<string, AvailableSlot[]> = {};
    for (const slot of slots) {
      const key = `${slot.doctorId}-${slot.startTime.slice(0, 2)}`;
      if (!map[key]) map[key] = [];
      map[key].push(slot);
    }
    return map;
  }, [slots]);

  const nextDay = useCallback(() => {
    const d = new Date(currentDateObj);
    d.setDate(d.getDate() + 1);
    router.push(`/appointments?date=${getDateString(d)}${selectedDoctorId ? `&doctorId=${selectedDoctorId}` : ""}`);
  }, [currentDateObj, router, selectedDoctorId]);

  const prevDay = useCallback(() => {
    const d = new Date(currentDateObj);
    d.setDate(d.getDate() - 1);
    router.push(`/appointments?date=${getDateString(d)}${selectedDoctorId ? `&doctorId=${selectedDoctorId}` : ""}`);
  }, [currentDateObj, router, selectedDoctorId]);

  const goToday = useCallback(() => {
    router.push(`/appointments${selectedDoctorId ? `?doctorId=${selectedDoctorId}` : ""}`);
  }, [router, selectedDoctorId]);

  const getAppointmentsForDoctorAndHour = useCallback(
    (doctorId: string, hour: string) => {
      return dayAppointments.filter(
        (a) => a.doctorId === doctorId && a.startTime.startsWith(hour.slice(0, 2))
      );
    },
    [dayAppointments]
  );

  const hours = useMemo(() => computeHours(slots), [slots]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of dayAppointments) {
      counts[a.status] = (counts[a.status] || 0) + 1;
    }
    return counts;
  }, [dayAppointments]);

  const displayDate = currentDateObj.toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const totalSlots = slots.length;
  const bookedSlots = slots.filter((s) => s.isBooked).length;

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-5 sm:p-6">
        <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-primary/5" />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Appointments</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage today&apos;s schedule and bookings</p>
          </div>
          <Button asChild>
            <a href="#new-booking"><Plus className="h-4 w-4" />New Booking</a>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-5 py-3">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold">{displayDate}</span>
          {isToday && <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">Today</Badge>}
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" onClick={prevDay} className="h-8 w-8" aria-label="Previous day">
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          {!isToday && <Button variant="outline" size="sm" onClick={goToday} className="h-8 text-xs">Today</Button>}
          <Button variant="outline" size="icon" onClick={nextDay} className="h-8 w-8" aria-label="Next day">
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-5 xl:flex-row">
        <div className="min-w-0 flex-1">
          <Card className="overflow-hidden rounded-xl border shadow-sm">
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="grid" style={{ gridTemplateColumns: `64px repeat(${filteredDoctors.length}, 1fr)` }}>
                  <div className="sticky left-0 z-10 border-b bg-muted/30 p-2 text-[10px] font-semibold uppercase text-muted-foreground">
                    Time
                  </div>
                  {filteredDoctors.map((doctor) => (
                    <div key={doctor.id} className="border-b border-l bg-muted/20 p-3 text-center">
                      <Link href={`/doctors/${doctor.id}`} className="group inline-block">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 to-primary text-sm font-bold text-white shadow-sm transition group-hover:shadow-md group-hover:scale-105">
                          {getInitials(doctor.name)}
                        </div>
                        <div className="mt-1.5 text-xs font-semibold leading-tight">{doctor.name}</div>
                        <div className="text-[10px] text-muted-foreground">{doctor.specialty ?? "General"}</div>
                      </Link>
                    </div>
                  ))}
                  {hours.map((hour) => (
                    <Fragment key={hour}>
                      <div className={cn(
                        "border-b border-r px-2 py-3 text-[11px] text-muted-foreground",
                        parseInt(hour) >= 12 && parseInt(hour) < 14 ? "bg-muted/10" : ""
                      )}>
                        <span className="font-medium">{formatTime(hour)}</span>
                      </div>
                      {filteredDoctors.map((doctor) => {
                        const hourApps = getAppointmentsForDoctorAndHour(doctor.id, hour);
                        const hourSlots = slotsByDoctorAndHour[`${doctor.id}-${hour}`] || [];
                        const availableCount = hourSlots.filter((s) => !s.isBooked).length;
                        const totalCount = hourSlots.length;
                        return (
                          <div key={`${doctor.id}-${hour}`} className={cn(
                            "relative min-h-[72px] border-b border-l p-1 transition-colors",
                            parseInt(hour) >= 12 && parseInt(hour) < 14 ? "bg-muted/5" : "",
                            totalCount > 0 && availableCount === 0 && "bg-red-50/20",
                            availableCount > 0 && "bg-green-50/5"
                          )}>
                            {hourApps.length === 0 && totalCount === 0 && (
                              <div className="flex h-full items-center justify-center">
                                <span className="text-[8px] text-muted-foreground/20">–</span>
                              </div>
                            )}
                            {totalCount > 0 && hourApps.length === 0 && (
                              <div className="mb-1 flex items-center gap-1 rounded px-1.5 py-0.5">
                                <span className={cn("text-[9px] font-medium", availableCount > 0 ? "text-green-600" : "text-red-400")}>
                                  {availableCount > 0 ? `${availableCount} open` : "Full"}
                                </span>
                              </div>
                            )}
                            {hourApps.map((app) => {
                              const cfg = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
                              return (
                                <Link key={app.id} href={`/appointments/${app.id}`} className="group relative z-10 mb-1 block rounded-lg border bg-background px-2 py-1.5 text-[11px] shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                                    <span className="flex-1 truncate font-semibold leading-none">{app.patientName}</span>
                                  </div>
                                  <div className="mt-1 flex items-center gap-1 text-[9px] text-muted-foreground">
                                    <Clock className="h-2.5 w-2.5 shrink-0" />
                                    <span>{formatTime(app.startTime)}</span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        );
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3">
              <div className="flex flex-wrap gap-2">
                {STATUS_GROUPS.map((sg) => {
                  const cfg = STATUS_CONFIG[sg.value as keyof typeof STATUS_CONFIG];
                  const count = statusCounts[sg.value] || 0;
                  return (
                    <Badge key={sg.value} variant="outline" className={cn("flex items-center gap-1.5 text-[10px] py-0.5", cfg?.badge ?? "")}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg?.dot ?? ""}`} />
                      {sg.label}
                      <span className="ml-0.5 font-bold">{count}</span>
                    </Badge>
                  );
                })}
              </div>
              <span className="text-[10px] text-muted-foreground">{bookedSlots}/{totalSlots} slots booked</span>
            </div>
          </Card>
        </div>

        <div id="new-booking" className="w-full shrink-0 xl:w-[380px]">
          <div className="rounded-xl border bg-card shadow-sm xl:sticky xl:top-20">
            <div className="border-b bg-gradient-to-r from-primary/5 to-transparent px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Plus className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-sm font-bold">New Booking</h2>
                  <p className="text-xs text-muted-foreground">Schedule a patient appointment</p>
                </div>
              </div>
            </div>
            <div className="max-h-none overflow-y-visible px-5 py-4 xl:max-h-[calc(100vh-180px)] xl:overflow-y-auto">
              <NewBookingForm doctors={doctors} onSuccess={() => {}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function NewBookingForm({ doctors, onSuccess }: { doctors: DoctorOption[]; onSuccess: () => void }) {
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState(getDateString(new Date()));
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [patients, setPatients] = useState<Array<{ id: string; fullName: string; phone: string }>>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [manualTime, setManualTime] = useState(getCurrentTimeRounded());
  const [showCreatePatient, setShowCreatePatient] = useState(false);
  const [creatingPatient, setCreatingPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    fullName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const searchIdRef = useRef(0);
  const searchPatients = useCallback(async (q: string) => {
    if (!q.trim()) { setPatients([]); return; }
    const id = ++searchIdRef.current;
    setSearchingPatient(true);
    try {
      const res = await fetch(`/api/patients/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (id === searchIdRef.current) setPatients(data);
    } catch {
      // ignore
    } finally {
      if (id === searchIdRef.current) setSearchingPatient(false);
    }
  }, []);

  const loadSlots = useCallback(async (doctorId: string, date: string) => {
    if (!doctorId || !date) return;
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/appointments/availability?doctorId=${doctorId}&date=${date}`);
      const data = await res.json();
      setAvailableSlots(data);
    } catch {
      // ignore
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  const handleCreatePatient = useCallback(async () => {
    if (!newPatient.fullName.trim() || !newPatient.phone.trim()) return;
    setCreatingPatient(true);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatient),
      });
      const created = await res.json();
      setSelectedPatientId(created.id);
      setPatientSearch(created.fullName);
      setShowCreatePatient(false);
      setNewPatient({
        fullName: "", phone: "", email: "", dateOfBirth: "",
        gender: "", bloodGroup: "", address: "",
        emergencyContactName: "", emergencyContactPhone: "",
      });
    } catch {
      // ignore
    } finally {
      setCreatingPatient(false);
    }
  }, [newPatient]);

  if (showCreatePatient) {
    return (
      <div className="grid gap-5">
        <div className="flex items-center gap-3 rounded-md border bg-muted/20 px-4 py-3">
          <span className="grid h-8 w-8 place-items-center rounded-md border bg-background text-foreground">
            <User className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">New Patient Registration</p>
            <p className="text-xs text-muted-foreground">Quick patient registration with essential fields.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Full name" required value={newPatient.fullName} onChange={(e) => setNewPatient((p) => ({ ...p, fullName: e.target.value }))} />
          <FormField label="Phone" required value={newPatient.phone} onChange={(e) => setNewPatient((p) => ({ ...p, phone: e.target.value }))} />
          <FormField label="Email" type="email" value={newPatient.email} onChange={(e) => setNewPatient((p) => ({ ...p, email: e.target.value }))} />
          <FormField label="Date of birth" type="date" value={newPatient.dateOfBirth} onChange={(e) => setNewPatient((p) => ({ ...p, dateOfBirth: e.target.value }))} />
          <SelectField
            label="Gender"
            value={newPatient.gender}
            onChange={(e) => setNewPatient((p) => ({ ...p, gender: e.target.value }))}
            options={[
              { value: "", label: "Select gender" },
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Other", label: "Other" }
            ]}
          />
          <SelectField
            label="Blood group"
            value={newPatient.bloodGroup}
            onChange={(e) => setNewPatient((p) => ({ ...p, bloodGroup: e.target.value }))}
            options={[
              { value: "", label: "Select blood group" },
              ...BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }))
            ]}
          />
          <TextareaField label="Address" className="md:col-span-2" rows={3} value={newPatient.address} onChange={(e) => setNewPatient((p) => ({ ...p, address: e.target.value }))} />
          <FormField label="Emergency contact name" value={newPatient.emergencyContactName} onChange={(e) => setNewPatient((p) => ({ ...p, emergencyContactName: e.target.value }))} />
          <FormField label="Emergency contact phone" value={newPatient.emergencyContactPhone} onChange={(e) => setNewPatient((p) => ({ ...p, emergencyContactPhone: e.target.value }))} />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setShowCreatePatient(false)}>Back</Button>
          <Button type="button" size="lg" disabled={creatingPatient || !newPatient.fullName.trim() || !newPatient.phone.trim()} onClick={handleCreatePatient}>
            {creatingPatient ? "Creating..." : "Save & Associate"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      action={createAppointmentAction}
      onSubmit={() => setTimeout(onSuccess, 100)}
      className="grid gap-5"
    >
      <div className="grid gap-2">
        <Label className="text-sm font-semibold">Patient</Label>
        {selectedPatientId ? (
          <div className="flex items-center gap-3 rounded-md border bg-muted/20 px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border bg-background text-xs font-bold text-foreground">
              {getInitials(patientSearch)}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{patientSearch}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedPatientId("");
                setPatientSearch("");
                setPatients([]);
              }}
              className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-primary"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <FormField
              placeholder="Search by name or phone..."
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                if (e.target.value.length >= 2) searchPatients(e.target.value);
              }}
              className="h-11 pl-10"
            />
          </div>
        )}
        {!selectedPatientId && searchingPatient && (
          <div className="flex items-center gap-2 rounded-md border p-3 text-sm text-muted-foreground">
            <Timer className="h-4 w-4 animate-spin" />
            Searching...
          </div>
        )}
        {!selectedPatientId && patients.length > 0 && (
          <div className="max-h-36 overflow-y-auto rounded-md border p-1.5">
            {patients.map((p) => (
              <button
                key={p.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition hover:bg-muted"
                onClick={() => {
                  setSelectedPatientId(p.id);
                  setPatientSearch(p.fullName);
                  setPatients([]);
                }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md border bg-background text-[10px] font-bold text-foreground">
                  {getInitials(p.fullName)}
                </span>
                <span>{p.fullName}</span>
                <span className="ml-auto text-xs text-muted-foreground">{p.phone}</span>
              </button>
            ))}
            <button
              type="button"
              className="mt-1.5 flex w-full items-center gap-3 border-t px-3 py-2.5 pt-2.5 text-left text-sm font-semibold text-foreground transition hover:bg-muted"
              onClick={() => setShowCreatePatient(true)}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md border bg-background">
                <Plus className="h-4 w-4" />
              </span>
              Create new patient
            </button>
          </div>
        )}
        {!selectedPatientId && patientSearch.length >= 2 && patients.length === 0 && !searchingPatient && (
          <div className="rounded-md border p-3 text-center text-sm">
            <p className="text-muted-foreground mb-2">No patients match &quot;{patientSearch}&quot;</p>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCreatePatient(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Create new patient
            </Button>
          </div>
        )}
        <input type="hidden" name="patientId" value={selectedPatientId} />
      </div>

      <SelectField
        label="Select Doctor"
        name="doctorId"
        required
        value={selectedDoctorId}
        onChange={(e) => {
          setSelectedDoctorId(e.target.value);
          if (e.target.value && selectedDate) loadSlots(e.target.value, selectedDate);
        }}
        options={[
          { value: "", label: "Select doctor" },
          ...doctors.map((d) => ({
            value: d.id,
            label: `${d.name} (${d.specialty ?? "General"})`,
          })),
        ]}
      />

      <FormField label="Date" name="appointmentDate" type="date" required min={getDateString(new Date())} value={selectedDate} onChange={(e) => {
        setSelectedDate(e.target.value);
        if (selectedDoctorId && e.target.value) loadSlots(selectedDoctorId, e.target.value);
      }} />

      <input type="hidden" name="startTime" value={selectedSlot?.startTime || manualTime} />
      <input type="hidden" name="slotId" value={selectedSlot?.id || ""} />
      <div className="grid gap-2">
        <Label className="text-sm font-semibold">Time</Label>
        {loadingSlots ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="h-4 w-4 animate-spin" />
            Loading available slots...
          </div>
        ) : availableSlots.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availableSlots.map((slot) => {
              const past = isTimeInPast(selectedDate, slot.startTime);
              const unavailable = past || slot.isBooked;
              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={unavailable}
                  onClick={() => {
                    if (unavailable) return;
                    setSelectedSlot(slot);
                    setManualTime("");
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3.5 py-2.5 text-sm font-medium transition-colors",
                    unavailable && "cursor-not-allowed opacity-40",
                    !unavailable && selectedSlot?.id === slot.id && "border-primary bg-muted text-foreground",
                    !unavailable && selectedSlot?.id !== slot.id && "hover:border-muted-foreground/30 hover:bg-muted/30"
                  )}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(slot.startTime)}
                  {slot.isBooked && (
                    <span className="ml-1 text-[10px] text-muted-foreground">Booked</span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormField type="time" value={manualTime}
                onChange={(e) => {
                  setManualTime(e.target.value);
                  setSelectedSlot(null);
                }}
              />
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CircleSlash className="mr-1 h-3 w-3" />
              No predefined slots
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Duration"
          name="endTime"
          options={[
            { value: "", label: "30 Mins" },
            { value: "09:15", label: "15 Mins" },
            { value: "09:30", label: "30 Mins" },
            { value: "09:45", label: "45 Mins" },
            { value: "10:00", label: "60 Mins" },
          ]}
        />
        <SelectField
          label="Type"
          name="type"
          defaultValue="in_clinic"
          options={[
            { value: "in_clinic", label: "In-Clinic" },
            { value: "tele_consult", label: "Tele-consult" },
            { value: "online", label: "Online" },
            { value: "walk_in", label: "Walk-in" },
          ]}
        />
      </div>
      <TextareaField label="Reason for Visit" name="reason" rows={2} />
      <TextareaField label="Notes (Optional)" name="notes" rows={2} />
      <SelectField
        label="Appointment Status"
        name="status"
        defaultValue="confirmed"
        options={[
          { value: "confirmed", label: "Confirmed" },
          { value: "pending", label: "Pending" },
          { value: "booked", label: "Booked" },
          { value: "cancelled", label: "Cancelled" },
        ]}
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" size="lg" className="w-full">Save Booking</Button>
      </div>
    </form>
  );
}