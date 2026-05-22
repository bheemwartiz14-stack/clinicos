"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, CircleSlash, Clock, Plus, Search, Timer, User, XCircle } from "lucide-react";
import { Fragment, useCallback, useMemo, useRef, useState } from "react";
import { createAppointmentAction } from "../actions/appointment.actions";
import type { AppointmentRecord, AvailableSlot, DoctorOption } from "../services/appointment.service";
import { FormField, SelectField, TextareaField } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@mediclinic/ui";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  booked: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200" },
  confirmed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  checked_in: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500", border: "border-violet-200" },
  in_consultation: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", border: "border-amber-200" },
  completed: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500", border: "border-green-200" },
  cancelled: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", border: "border-rose-200" },
  rescheduled: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500", border: "border-orange-200" },
  no_show: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400", border: "border-gray-200" },
  pending: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500", border: "border-yellow-200" },
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

const HOURS = Array.from({ length: 10 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

function getCurrentTimeRounded() {
  const now = new Date();
  const minutes = now.getMinutes();
  const rounded = Math.ceil(minutes / 30) * 30;
  now.setMinutes(rounded, 0, 0);
  return now.toTimeString().slice(0, 5);
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

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of dayAppointments) {
      counts[a.status] = (counts[a.status] || 0) + 1;
    }
    return counts;
  }, [dayAppointments]);

  const totalAppointments = dayAppointments.length;

  return (
    <div className="flex gap-5">
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" onClick={prevDay} className="h-8 w-8" aria-label="Previous day">
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant={isToday ? "default" : "outline"} size="sm" onClick={goToday} className="h-8 text-xs">Today</Button>
            <Button variant="outline" size="icon" onClick={nextDay} className="h-8 w-8" aria-label="Next day">
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <span className="ml-1 text-xs font-semibold">
              {currentDateObj.toLocaleDateString("en", { weekday: "short", day: "numeric", month: "short" })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-1">
              {STATUS_GROUPS.map((sg) => {
                const st = STATUS_STYLES[sg.value];
                const count = statusCounts[sg.value] || 0;
                return (
                  <Badge key={sg.value} variant="outline" className={cn("flex items-center gap-1 border-0 text-[10px] py-0.5", st.bg, st.text)}>
                    <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                    {sg.label}
                    <span className="ml-0.5 font-bold">{count}</span>
                  </Badge>
                );
              })}
            </div>
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              value={selectedDoctorId}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                if (e.target.value) params.set("doctorId", e.target.value);
                else params.delete("doctorId");
                router.push(`/appointments?${params.toString()}`);
              }}
            >
              <option value="">All Doctors</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>{doc.name}</option>
              ))}
            </select>
          </div>
        </div>

        <Card className="overflow-hidden rounded-xl border-0 shadow-md">
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid" style={{ gridTemplateColumns: `60px repeat(${filteredDoctors.length}, 1fr)` }}>
                <div className="sticky left-0 z-10 border-b bg-gradient-to-r from-muted/80 to-muted/30 p-2 text-[10px] font-semibold uppercase text-muted-foreground">
                  Time
                </div>
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.id} className="border-b border-l bg-gradient-to-b from-muted/50 to-muted/20 p-2 text-center">
                    <Link href={`/doctors/${doctor.id}`} className="group inline-block">
                      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary transition group-hover:bg-primary group-hover:text-white">
                        {getInitials(doctor.name)}
                      </div>
                      <div className="mt-1 text-[10px] font-semibold leading-tight">{doctor.name}</div>
                      <div className="text-[8px] text-muted-foreground">{doctor.specialty ?? "General"}</div>
                    </Link>
                  </div>
                ))}

                {HOURS.map((hour) => (
                  <Fragment key={hour}>
                    <div
                      className={cn(
                        "border-b border-r px-1.5 py-2 text-[10px] text-muted-foreground",
                        parseInt(hour) >= 12 && parseInt(hour) < 14 ? "bg-muted/10" : ""
                      )}
                    >
                      <span className="font-medium">{formatTime(hour)}</span>
                    </div>
                    {filteredDoctors.map((doctor) => {
                      const hourApps = getAppointmentsForDoctorAndHour(doctor.id, hour);
                      return (
                        <div
                          key={`${doctor.id}-${hour}`}
                          className={cn(
                            "relative min-h-[60px] border-b border-l p-1 transition-colors",
                            parseInt(hour) >= 12 && parseInt(hour) < 14 ? "bg-muted/5" : ""
                          )}
                        >
                          {hourApps.length === 0 && (
                            <div className="flex h-full items-center justify-center">
                              <span className="text-[8px] text-muted-foreground/30">—</span>
                            </div>
                          )}
                          {hourApps.map((app) => {
                            const style = STATUS_STYLES[app.status] || STATUS_STYLES.pending;
                            return (
                              <Link
                                key={app.id}
                                href={`/appointments/${app.id}`}
                                className={cn(
                                  "group relative z-10 mb-0.5 block rounded border px-1.5 py-1 text-[10px] shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5",
                                  style.bg, style.border
                                )}
                              >
                                <div className="flex items-center gap-1">
                                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                                  <span className="flex-1 truncate font-semibold leading-none">{app.patientName}</span>
                                </div>
                                <div className="mt-0.5 flex items-center gap-1 text-[8px] opacity-75">
                                  <Clock className="h-2.5 w-2.5" />
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
        </Card>
      </div>

      <div className="w-[380px] shrink-0 hidden lg:block">
        <div className="sticky top-5 rounded-xl border bg-card shadow-sm">
          <div className="border-b px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-white shadow-sm">
                <Plus className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold">New Appointment Booking</h2>
                <p className="text-[11px] text-muted-foreground">Book a new appointment for a patient.</p>
              </div>
            </div>
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-5 py-4">
            <NewBookingForm doctors={doctors} onSuccess={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function NewBookingForm({ doctors, onSuccess }: { doctors: DoctorOption[]; onSuccess: () => void }) {
  const router = useRouter();
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
        <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">New Patient Registration</p>
            <p className="text-xs text-muted-foreground">Quick patient registration with essential fields.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">Full name <span className="text-red-500">*</span></Label>
            <Input className="h-11" value={newPatient.fullName} onChange={(e) => setNewPatient((p) => ({ ...p, fullName: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">Phone <span className="text-red-500">*</span></Label>
            <Input className="h-11" value={newPatient.phone} onChange={(e) => setNewPatient((p) => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">Email</Label>
            <Input type="email" className="h-11" value={newPatient.email} onChange={(e) => setNewPatient((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">Date of birth</Label>
            <Input type="date" className="h-11" value={newPatient.dateOfBirth} onChange={(e) => setNewPatient((p) => ({ ...p, dateOfBirth: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">Gender</Label>
            <select className="h-11 rounded-md border border-input bg-background px-3 text-sm" value={newPatient.gender} onChange={(e) => setNewPatient((p) => ({ ...p, gender: e.target.value }))}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">Blood group</Label>
            <select className="h-11 rounded-md border border-input bg-background px-3 text-sm" value={newPatient.bloodGroup} onChange={(e) => setNewPatient((p) => ({ ...p, bloodGroup: e.target.value }))}>
              <option value="">Select blood group</option>
              {BLOOD_GROUPS.map((bg) => (<option key={bg} value={bg}>{bg}</option>))}
            </select>
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label className="text-sm font-semibold">Address</Label>
            <textarea className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={newPatient.address} onChange={(e) => setNewPatient((p) => ({ ...p, address: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">Emergency contact name</Label>
            <Input className="h-11" value={newPatient.emergencyContactName} onChange={(e) => setNewPatient((p) => ({ ...p, emergencyContactName: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">Emergency contact phone</Label>
            <Input className="h-11" value={newPatient.emergencyContactPhone} onChange={(e) => setNewPatient((p) => ({ ...p, emergencyContactPhone: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setShowCreatePatient(false)}>Back</Button>
          <Button type="button" size="lg" className="bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20" disabled={creatingPatient || !newPatient.fullName.trim() || !newPatient.phone.trim()} onClick={handleCreatePatient}>
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
          <div className="flex items-center gap-3 rounded-lg border bg-primary/5 px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
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
            <Input
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
          <div className="flex items-center gap-2 rounded-lg border p-3 text-sm text-muted-foreground">
            <Timer className="h-4 w-4 animate-spin" />
            Searching...
          </div>
        )}
        {!selectedPatientId && patients.length > 0 && (
          <div className="max-h-36 overflow-y-auto rounded-lg border p-1.5 shadow-sm">
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
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {getInitials(p.fullName)}
                </span>
                <span>{p.fullName}</span>
                <span className="ml-auto text-xs text-muted-foreground">{p.phone}</span>
              </button>
            ))}
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-primary transition hover:bg-primary/5 border-t mt-1.5 pt-2.5"
              onClick={() => setShowCreatePatient(true)}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                <Plus className="h-4 w-4" />
              </span>
              Create new patient
            </button>
          </div>
        )}
        {!selectedPatientId && patientSearch.length >= 2 && patients.length === 0 && !searchingPatient && (
          <div className="rounded-lg border p-3 text-center text-sm">
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
            {availableSlots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => {
                  setSelectedSlot(slot);
                  setManualTime("");
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-all",
                  selectedSlot?.id === slot.id
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "hover:border-muted-foreground/30 hover:bg-muted/30"
                )}
              >
                <Clock className="h-3.5 w-3.5" />
                {formatTime(slot.startTime)}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input type="time" className="h-11" value={manualTime}
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
        <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20">Save Booking</Button>
      </div>
    </form>
  );
}
