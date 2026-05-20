"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@mediclinic/ui";
import {
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListChecks,
  RefreshCw,
  Search,
  Sparkles,
  UserCheck,
  Video,
  XCircle
} from "lucide-react";
import {
  checkInAppointmentAction,
  createAppointmentAction,
  rescheduleAppointmentAction,
  updateAppointmentStatusAction,
  type AppointmentActionState
} from "../actions/appointment.actions";
import { appointmentBookingFormSchema, type AppointmentBookingFormData } from "../validations/appointment.validation";

type AppointmentRecord = {
  id: string;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  patientMrn: string;
  doctorId: string;
  doctorFirstName: string;
  doctorLastName: string;
  doctorSpecialization: string;
  status: "scheduled" | "checked_in" | "in_room" | "completed" | "cancelled" | "no_show";
  consultationMode: "offline" | "online" | "hybrid";
  startsAt: string | Date;
  endsAt: string | Date;
  reason: string;
  notes: string | null;
  queueToken: string | null;
  queuePriority: "routine" | "priority" | "emergency";
  checkedInAt: string | Date | null;
  googleCalendarEventId: string | null;
  googleMeetLink: string | null;
  meetingUrl: string | null;
  aiIntakeSummary: string | null;
};

type QueueRecord = {
  id: string;
  token: string;
  priority: "routine" | "priority" | "emergency";
  status: string;
  checkedInAt: string | Date;
  patientFirstName: string;
  patientLastName: string;
  doctorFirstName: string;
  doctorLastName: string;
};

type Option = { id: string; label: string; visitDurationMinutes?: number | null };

type AppointmentsViewProps = {
  appointments: AppointmentRecord[];
  queue: QueueRecord[];
  patients: Option[];
  doctors: Option[];
  canManage: boolean;
};

const initialState: AppointmentActionState = { ok: false, message: "" };

const statusMeta: Record<AppointmentRecord["status"], { label: string; className: string }> = {
  scheduled: { label: "Pending", className: "bg-amber-50 text-amber-700" },
  checked_in: { label: "Checked-in", className: "bg-sky-50 text-sky-700" },
  in_room: { label: "Confirmed", className: "bg-teal-50 text-teal-700" },
  completed: { label: "Completed", className: "bg-emerald-50 text-emerald-700" },
  cancelled: { label: "Cancelled", className: "bg-rose-50 text-rose-700" },
  no_show: { label: "No-show", className: "bg-slate-100 text-slate-700" }
};

function name(first: string, last: string) {
  return `${first} ${last}`.trim();
}

function formatTime(value: string | Date) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function formatDay(value: string | Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date(value));
}

function toDateTimeLocal(value: string | Date) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function withinDays(date: Date, days: number) {
  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() + days);
  return date >= new Date(now.toDateString()) && date <= end;
}

function ActionMessage({ state }: { state: AppointmentActionState }) {
  if (!state.message) return null;
  return (
    <p className={`rounded-lg px-3 py-2 text-sm font-medium ${state.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
      {state.message}
    </p>
  );
}

function BookingForm({ patients, doctors, canManage }: { patients: Option[]; doctors: Option[]; canManage: boolean }) {
  const [state, action, isPending] = useActionState(createAppointmentAction, initialState);
  const [mode, setMode] = useState("offline");
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    resolver: zodResolver(appointmentBookingFormSchema) as any,
    mode: "onBlur"
  });

  useEffect(() => {
    if (state.message) {
      if (state.ok) {
        setFormMessage({ type: 'success', text: state.message });
      } else {
        setFormMessage({ type: 'error', text: state.message });
      }
    }
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([key, messages]) => {
        if (messages && messages.length > 0) {
          setError(key as any, { message: messages[0] });
        }
      });
    }
  }, [state, setError]);

  const onSubmit = (data: any) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value != null) {
        formData.append(key, String(value));
      }
    });
    action(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-primary" aria-hidden />
        <h2 className="text-lg font-semibold text-foreground">Fast booking</h2>
      </div>

      {formMessage && (
        <div className={`mt-3 rounded-lg px-3 py-2 text-sm font-medium ${formMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {formMessage.text}
        </div>
      )}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-foreground">
            Patient <span className="text-red-500">*</span>
          </span>
          <select
            {...register("patientId")}
            className={cn(
              "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20",
              errors.patientId && "border-rose-400"
            )}
          >
            <option value="">Select patient</option>
            {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.label}</option>)}
          </select>
          {errors.patientId && <span className="text-xs font-medium text-rose-500">{String(errors.patientId.message ?? "")}</span>}
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-foreground">
            Doctor <span className="text-red-500">*</span>
          </span>
          <select
            {...register("doctorId")}
            className={cn(
              "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20",
              errors.doctorId && "border-rose-400"
            )}
          >
            <option value="">Select doctor</option>
            {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.label}</option>)}
          </select>
          {errors.doctorId && <span className="text-xs font-medium text-rose-500">{String(errors.doctorId.message ?? "")}</span>}
        </label>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-foreground">
            Start time <span className="text-red-500">*</span>
          </span>
          <input
            type="datetime-local"
            {...register("startsAt")}
            className={cn(
              "h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20",
              errors.startsAt && "border-rose-400"
            )}
          />
          {errors.startsAt && <span className="text-xs font-medium text-rose-500">{String(errors.startsAt.message ?? "")}</span>}
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-foreground">Duration</span>
          <select {...register("durationMinutes")} className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20">
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">60 min</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-foreground">Priority</span>
          <select {...register("queuePriority")} className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20">
            <option value="routine">Routine</option>
            <option value="priority">Priority</option>
            <option value="emergency">Emergency</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-foreground">Visit mode</span>
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20">
            <option value="offline">Clinic</option>
            <option value="online">Online</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </label>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <input type="hidden" {...register("consultationMode")} value={mode} />
        <input type="hidden" {...register("locationType")} value={mode === "online" ? "online" : "clinic"} />
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-foreground">
            Reason <span className="text-red-500">*</span>
          </span>
          <input
            {...register("reason")}
            placeholder="Follow-up, fever, annual physical..."
            className={cn(
              "h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20",
              errors.reason && "border-rose-400"
            )}
          />
          {errors.reason && <span className="text-xs font-medium text-rose-500">{String(errors.reason.message ?? "")}</span>}
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-foreground">Notes</span>
          <input {...register("notes")} className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </label>
      </div>
      <div className="mt-4">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-foreground">ICD-10 codes</span>
          <input {...register("icd10Codes")} placeholder="R50.9, Z00.00" className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </label>
      </div>
      <div className="mt-5 flex justify-end">
        <button type="submit" disabled={!canManage || isPending} className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">
          {isPending ? "Booking..." : "Book appointment"}
        </button>
      </div>
    </form>
  );
}

function AppointmentActions({ appointment, canManage }: { appointment: AppointmentRecord; canManage: boolean }) {
  const [checkInState, checkInAction, checkInPending] = useActionState(checkInAppointmentAction, initialState);
  const [statusState, statusAction, statusPending] = useActionState(updateAppointmentStatusAction, initialState);
  const [rescheduleState, rescheduleAction, reschedulePending] = useActionState(rescheduleAppointmentAction, initialState);

  return (
    <div className="grid gap-3">
      <ActionMessage state={checkInState.message ? checkInState : statusState.message ? statusState : rescheduleState} />
      <div className="flex flex-wrap gap-2">
        <form action={checkInAction}>
          <input type="hidden" name="appointmentId" value={appointment.id} />
          <input type="hidden" name="priority" value={appointment.queuePriority} />
          <button disabled={!canManage || checkInPending || appointment.status !== "scheduled"} className="inline-flex h-9 items-center gap-2 rounded-lg border bg-white px-3 text-sm font-semibold text-slate-700 disabled:opacity-50">
            <UserCheck className="h-4 w-4" aria-hidden /> Check in
          </button>
        </form>
        <form action={statusAction}>
          <input type="hidden" name="appointmentId" value={appointment.id} />
          <input type="hidden" name="status" value="completed" />
          <button disabled={!canManage || statusPending || appointment.status === "completed"} className="inline-flex h-9 items-center gap-2 rounded-lg border bg-white px-3 text-sm font-semibold text-slate-700 disabled:opacity-50">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> Complete
          </button>
        </form>
        <form action={statusAction}>
          <input type="hidden" name="appointmentId" value={appointment.id} />
          <input type="hidden" name="status" value="cancelled" />
          <button disabled={!canManage || statusPending || appointment.status === "cancelled"} className="inline-flex h-9 items-center gap-2 rounded-lg border bg-white px-3 text-sm font-semibold text-slate-700 disabled:opacity-50">
            <XCircle className="h-4 w-4" aria-hidden /> Cancel
          </button>
        </form>
      </div>
      <form action={rescheduleAction} className="grid gap-2 md:grid-cols-[1fr_110px_auto]">
        <input type="hidden" name="appointmentId" value={appointment.id} />
        <input name="startsAt" type="datetime-local" defaultValue={toDateTimeLocal(appointment.startsAt)} className="h-9 rounded-lg border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        <select name="durationMinutes" defaultValue="30" className="h-9 rounded-lg border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
          <option value="15">15 min</option>
          <option value="30">30 min</option>
          <option value="45">45 min</option>
          <option value="60">60 min</option>
        </select>
        <button disabled={!canManage || reschedulePending} className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white disabled:opacity-50">
          <RefreshCw className="h-4 w-4" aria-hidden /> Reschedule
        </button>
      </form>
    </div>
  );
}

export function AppointmentsView({ appointments, queue, patients, doctors, canManage }: AppointmentsViewProps) {
  const [view, setView] = useState<"day" | "week" | "month">("day");
  const [doctorId, setDoctorId] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    return appointments.filter((appointment) => {
      const starts = new Date(appointment.startsAt);
      const matchesView = view === "day" ? sameDay(starts, new Date()) : view === "week" ? withinDays(starts, 7) : withinDays(starts, 31);
      const matchesDoctor = doctorId === "all" || appointment.doctorId === doctorId;
      const haystack = [
        name(appointment.patientFirstName, appointment.patientLastName),
        name(appointment.doctorFirstName, appointment.doctorLastName),
        appointment.patientMrn,
        appointment.reason
      ].join(" ").toLowerCase();
      return matchesView && matchesDoctor && (!needle || haystack.includes(needle));
    });
  }, [appointments, doctorId, query, view]);

  const todayCount = appointments.filter((appointment) => sameDay(new Date(appointment.startsAt), new Date())).length;
  const checkedIn = appointments.filter((appointment) => appointment.status === "checked_in").length;
  const noShowRisk = appointments.filter((appointment) => appointment.status === "scheduled" && appointment.queuePriority !== "routine").length;
  const onlineVisits = appointments.filter((appointment) => appointment.consultationMode === "online").length;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Appointment Management</h1>
          <p className="mt-2 text-sm text-slate-600">Book visits, run doctor schedules, manage queues, reschedule patients, and coordinate Google Calendar or Meet workflows.</p>
        </div>
        <div className="inline-flex rounded-lg border bg-white p-1">
          {(["day", "week", "month"] as const).map((item) => (
            <button key={item} onClick={() => setView(item)} className={`h-9 rounded-md px-3 text-sm font-semibold capitalize ${view === item ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-card p-4"><Clock3 className="mb-3 h-5 w-5 text-primary" /><p className="text-sm text-slate-500">Today</p><p className="text-2xl font-semibold">{todayCount}</p></div>
        <div className="rounded-xl border bg-card p-4"><UserCheck className="mb-3 h-5 w-5 text-primary" /><p className="text-sm text-slate-500">Checked-in</p><p className="text-2xl font-semibold">{checkedIn}</p></div>
        <div className="rounded-xl border bg-card p-4"><Video className="mb-3 h-5 w-5 text-primary" /><p className="text-sm text-slate-500">Online visits</p><p className="text-2xl font-semibold">{onlineVisits}</p></div>
        <div className="rounded-xl border bg-card p-4"><Sparkles className="mb-3 h-5 w-5 text-primary" /><p className="text-sm text-slate-500">AI risk flags</p><p className="text-2xl font-semibold">{noShowRisk}</p></div>
      </div>

      <BookingForm patients={patients} doctors={doctors} canManage={canManage} />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold">Doctor-wise calendar</h2>
            <div className="grid gap-2 md:grid-cols-[220px_260px]">
              <select value={doctorId} onChange={(event) => setDoctorId(event.target.value)} className="h-10 rounded-lg border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option value="all">All doctors</option>
                {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.label}</option>)}
              </select>
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patient, doctor, reason" className="h-10 w-full rounded-lg border bg-white pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </label>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {filtered.map((appointment) => (
              <article key={appointment.id} className="rounded-xl border bg-white p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{formatDay(appointment.startsAt)} · {formatTime(appointment.startsAt)}-{formatTime(appointment.endsAt)}</p>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusMeta[appointment.status].className}`}>{statusMeta[appointment.status].label}</span>
                      {appointment.queueToken ? <span className="rounded-full bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700">{appointment.queueToken}</span> : null}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{name(appointment.patientFirstName, appointment.patientLastName)} · {appointment.patientMrn}</p>
                    <p className="mt-1 text-sm text-slate-600">Dr. {name(appointment.doctorFirstName, appointment.doctorLastName)} · {appointment.doctorSpecialization}</p>
                    <p className="mt-3 text-sm font-medium text-slate-900">{appointment.reason}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-slate-100 px-2 py-1">{appointment.consultationMode}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1">{appointment.queuePriority}</span>
                      {appointment.googleCalendarEventId ? <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">Google Calendar</span> : null}
                      {appointment.googleMeetLink || appointment.meetingUrl ? <span className="rounded-full bg-sky-50 px-2 py-1 text-sky-700">Google Meet</span> : null}
                    </div>
                  </div>
                  <div className="min-w-0 lg:w-[420px]">
                    <AppointmentActions appointment={appointment} canManage={canManage} />
                  </div>
                </div>
              </article>
            ))}
            {filtered.length === 0 ? <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">No appointments in this {view} view.</p> : null}
          </div>
        </div>

        <div className="grid gap-6">
          <section className="rounded-xl border bg-card p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><ListChecks className="h-5 w-5 text-primary" /> Queue</h2>
            <div className="mt-4 grid gap-3">
              {queue.map((entry) => (
                <div key={entry.id} className="rounded-lg border bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{entry.token} · {name(entry.patientFirstName, entry.patientLastName)}</p>
                      <p className="mt-1 text-xs text-slate-500">Dr. {name(entry.doctorFirstName, entry.doctorLastName)} · {formatTime(entry.checkedInAt)}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{entry.priority}</span>
                  </div>
                </div>
              ))}
              {queue.length === 0 ? <p className="rounded-lg border border-dashed p-4 text-sm text-slate-500">No checked-in patients are waiting.</p> : null}
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Bot className="h-5 w-5 text-primary" /> AI assistant</h2>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="rounded-lg border bg-white p-4"><p className="font-semibold">Smart slot suggestions</p><p className="mt-1 text-slate-600">Use doctor duration, queue pressure, and current gaps to choose the next available time.</p></div>
              <div className="rounded-lg border bg-white p-4"><p className="font-semibold">No-show prediction</p><p className="mt-1 text-slate-600">{noShowRisk} active appointment(s) have elevated operational risk from priority or timing signals.</p></div>
              <div className="rounded-lg border bg-white p-4"><p className="font-semibold">Reminder optimization</p><p className="mt-1 text-slate-600">Prioritize SMS or WhatsApp reminders for online, rescheduled, and high-priority visits.</p></div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
