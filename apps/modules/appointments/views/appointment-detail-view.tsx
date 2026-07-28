"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, CalendarDays, CheckCircle2, Clock, FileText, Hash, Phone, RefreshCw, Stethoscope, Timer, User, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { updateAppointmentStatusAction, rescheduleAppointmentAction } from "../actions/appointment.actions";
import type { AppointmentRecord, AvailableSlot } from "../types/appointment.types";
import { FormField, TextareaField } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@mediclinic/ui";

const STATUS_STYLES: Record<string, { badge: string; bg: string; text: string; dot: string }> = {
  booked: { badge: "border-slate-200 bg-slate-100 text-slate-700", bg: "bg-slate-50", text: "text-slate-700", dot: "bg-slate-500" },
  confirmed: { badge: "border-emerald-200 bg-emerald-100 text-emerald-700", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  checked_in: { badge: "border-blue-200 bg-blue-100 text-blue-700", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  in_consultation: { badge: "border-amber-200 bg-amber-100 text-amber-700", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  completed: { badge: "border-green-200 bg-green-100 text-green-700", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  cancelled: { badge: "border-red-200 bg-red-100 text-red-700", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  rescheduled: { badge: "border-orange-200 bg-orange-100 text-orange-700", bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  no_show: { badge: "border-gray-200 bg-gray-100 text-gray-600", bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" },
  pending: { badge: "border-yellow-200 bg-yellow-100 text-yellow-700", bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
};

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

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

function getDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isTimeInPast(date: string, time: string): boolean {
  if (date !== getDateString(new Date())) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m < currentMinutes;
}

export function AppointmentDetailView({ appointment }: { appointment: AppointmentRecord }) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getDateString(new Date()));
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  const loadSlots = useCallback(async (doctorId: string, date: string) => {
    if (!doctorId || !date) return;
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/appointments/availability?doctorId=${doctorId}&date=${date}`);
      const data = await res.json();
      setAvailableSlots(data);
      setSelectedSlot(null);
    } catch {
      // ignore
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (rescheduleOpen && appointment.doctorId) {
      loadSlots(appointment.doctorId, selectedDate);
    }
  }, [rescheduleOpen, appointment.doctorId, loadSlots]);

  const style = STATUS_STYLES[appointment.status] || STATUS_STYLES.pending;

  const actionButtons = [
    { label: "Check-in", status: "checked_in", show: appointment.status === "confirmed" || appointment.status === "booked", variant: "default" as const },
    { label: "Start Consultation", status: "in_consultation", show: appointment.status === "checked_in", variant: "secondary" as const },
    { label: "Mark Completed", status: "completed", show: appointment.status === "in_consultation" || appointment.status === "checked_in", variant: "secondary" as const },
    { label: "No Show", status: "no_show", show: appointment.status !== "completed" && appointment.status !== "cancelled" && appointment.status !== "no_show", variant: "outline" as const },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/[0.08] via-primary/[0.02] to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-20 w-20 translate-y-8 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-xl border bg-background/50 backdrop-blur-sm">
              <Link href="/appointments"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="flex items-center gap-4">
              <span className={`flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg ring-4 ring-background ${avatarColor(appointment.patientName)}`}>
                {getInitials(appointment.patientName)}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">{appointment.patientName}</h1>
                  <Badge className={style.badge}>
                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {appointment.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{appointment.patientPhone}</span>
                  <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{appointment.appointmentDate}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatTime(appointment.startTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-xl border shadow-sm transition-all hover:shadow-md">
          <CardHeader className="border-b bg-gradient-to-r from-primary/[0.03] to-transparent pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary"><User className="h-3.5 w-3.5" /></span>
              Patient Info
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            <InfoRow label="Name" value={appointment.patientName} />
            <InfoRow label="Phone" value={appointment.patientPhone} />
            {appointment.reason && <InfoRow label="Reason" value={appointment.reason} />}
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm transition-all hover:shadow-md">
          <CardHeader className="border-b bg-gradient-to-r from-emerald/[0.03] to-transparent pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600"><Stethoscope className="h-3.5 w-3.5" /></span>
              Doctor
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            <InfoRow label="Name" value={appointment.doctorName} />
            <InfoRow label="Specialty" value={appointment.doctorSpecialty ?? "General"} />
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm transition-all hover:shadow-md">
          <CardHeader className="border-b bg-gradient-to-r from-violet/[0.03] to-transparent pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-500/10 text-violet-600"><Calendar className="h-3.5 w-3.5" /></span>
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            <InfoRow label="Date & Time" value={`${appointment.appointmentDate} · ${formatTime(appointment.startTime)}`} />
            <div className="flex items-center gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-muted/20">
              <span className="text-muted-foreground min-w-[90px]">Type</span>
              <Badge variant="outline" className="ml-auto capitalize font-medium">{appointment.type.replace(/_/g, " ")}</Badge>
            </div>
            {appointment.queueTokenNumber && (
              <div className="flex items-center gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-muted/20">
                <span className="text-muted-foreground min-w-[90px]">Token</span>
                <span className="ml-auto flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-lg font-bold tabular-nums">{String(appointment.queueTokenNumber).padStart(2, "0")}</span>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-primary/[0.03] to-transparent">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary"><CheckCircle2 className="h-3.5 w-3.5" /></span>
            Actions
          </CardTitle>
          <CardDescription>Manage appointment status, reschedule, or cancel.</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex flex-wrap gap-2">
            {actionButtons.map((btn) =>
              btn.show && (
                <form key={btn.status} action={updateAppointmentStatusAction}>
                  <input type="hidden" name="appointmentId" value={appointment.id} />
                  <input type="hidden" name="newStatus" value={btn.status} />
                  <Button type="submit" variant={btn.variant} size="sm">
                    {btn.status === "checked_in" && <CheckCircle2 className="mr-1.5 h-4 w-4" />}
                    {btn.status === "in_consultation" && <Stethoscope className="mr-1.5 h-4 w-4" />}
                    {btn.status === "completed" && <CheckCircle2 className="mr-1.5 h-4 w-4" />}
                    {btn.status === "no_show" && <XCircle className="mr-1.5 h-4 w-4" />}
                    {btn.label}
                  </Button>
                </form>
              )
            )}

            <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={appointment.status === "completed" || appointment.status === "cancelled"}>
                  <RefreshCw className="mr-1.5 h-4 w-4" />
                  Reschedule
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Reschedule Appointment</DialogTitle>
                  <DialogDescription>Select a new date and time for this appointment.</DialogDescription>
                </DialogHeader>
                <form action={rescheduleAppointmentAction} onSubmit={() => setTimeout(() => setRescheduleOpen(false), 100)} className="grid gap-4">
                  <input type="hidden" name="appointmentId" value={appointment.id} />
                  <input type="hidden" name="newStartTime" value={selectedSlot?.startTime || ""} />
                  <input type="hidden" name="newSlotId" value={selectedSlot?.id || ""} />
                  <FormField label="New Date" name="newDate" type="date" required min={getDateString(new Date())} value={selectedDate} onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (appointment.doctorId && e.target.value) loadSlots(appointment.doctorId, e.target.value);
                  }} />
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold">Select Time</Label>
                    {loadingSlots ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Timer className="h-4 w-4 animate-spin" />Loading available slots...</div>
                    ) : availableSlots.filter((s) => !s.isBooked && !isTimeInPast(selectedDate, s.startTime)).length > 0 ? (
                      <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                        {availableSlots.filter((s) => !s.isBooked && !isTimeInPast(selectedDate, s.startTime)).map((slot) => (
                          <button key={slot.id} type="button" onClick={() => setSelectedSlot(slot)}
                            className={cn("flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-all",
                              selectedSlot?.id === slot.id ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/20" : "hover:border-muted-foreground/30 hover:bg-muted/20")}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(slot.startTime)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No slots available for this date.</p>
                    )}
                  </div>
                  <TextareaField label="Reason for reschedule" name="reason" rows={2} />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setRescheduleOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={!selectedSlot}>Confirm Reschedule</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <form action={updateAppointmentStatusAction} onSubmit={(e) => {
              if (!confirm("Are you sure you want to cancel this appointment?")) e.preventDefault();
            }}>
              <input type="hidden" name="appointmentId" value={appointment.id} />
              <input type="hidden" name="newStatus" value="cancelled" />
              <Button type="submit" variant="destructive" size="sm" disabled={appointment.status === "completed" || appointment.status === "cancelled"}>
                <XCircle className="mr-1.5 h-4 w-4" />
                Cancel
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {appointment.notes && (
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-amber/[0.03] to-transparent">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500/10 text-amber-600"><FileText className="h-3.5 w-3.5" /></span>
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <p className="text-sm leading-relaxed text-muted-foreground">{appointment.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-muted/20">
      <span className="text-muted-foreground min-w-[90px]">{label}</span>
      <span className="font-medium ml-auto text-right">{value}</span>
    </div>
  );
}
