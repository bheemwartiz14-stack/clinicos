"use client";

import {
  CalendarDays,
  Clock3,
  LinkIcon,
  ListChecks,
  Loader2,
  MessageSquareText,
  Plus,
  Search,
  Ticket,
  UserRoundCheck,
  Video,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import toast, { Toaster } from "react-hot-toast";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { offlineDb } from "@/lib/offline/db";
import { enqueueMutation } from "@/lib/offline/sync-engine";
import { useNetworkStore } from "@/lib/store/network-store";
import type { ActionState, AppointmentsPageModel, CalendarSlot } from "../appointments.types";

type AppointmentsViewProps = AppointmentsPageModel & {
  action: (formData: FormData) => Promise<ActionState>;
};

const STATUS_OPTIONS = [
  { label: "Booked", value: "booked" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Checked in", value: "checked_in" },
  { label: "In queue", value: "in_queue" },
  { label: "In consultation", value: "in_consultation" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "No show", value: "no_show" },
  { label: "Rescheduled", value: "rescheduled" },
];

const SLOT_DURATIONS = [10, 15, 20, 30, 45, 60];

function formatTimeRange(startAt: Date, endAt: Date) {
  const formatter = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formatter.format(new Date(startAt))} - ${formatter.format(new Date(endAt))}`;
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(date));
}

function toDateInputValue(date: Date) {
  const value = new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
    value.getDate(),
  ).padStart(2, "0")}`;
}

function toTimeInputValue(date: Date) {
  const value = new Date(date);
  return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(
    2,
    "0",
  )}`;
}

export function AppointmentsToast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "border bg-background text-foreground shadow-lg",
        duration: 3500,
      }}
    />
  );
}

export function AppointmentsView({
  action,
  appointments,
  branchOptions,
  breadcrumb,
  calendarSlots,
  description,
  doctorId,
  doctorOptions,
  patientOptions,
  query,
  selectedDate,
  stats,
  status,
  title,
}: AppointmentsViewProps) {
  const fieldId = useId();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const online = useNetworkStore((state) => state.online);

  useEffect(() => {
    let active = true;
    async function refreshQueueCount() {
      const count = await offlineDb.queue.where("entity").equals("appointment").count();
      if (active) setOfflineQueueCount(count);
    }

    void refreshQueueCount();
    return () => {
      active = false;
    };
  }, []);

  async function queueOfflineMutation(formData: FormData, operation: "create" | "update") {
    const payload = Object.fromEntries(formData.entries());
    await enqueueMutation({
      createdAt: new Date().toISOString(),
      entity: "appointment",
      id: crypto.randomUUID(),
      operation,
      payload,
    });
    setOfflineQueueCount((count) => count + 1);
  }

  function fillSlot(slot: CalendarSlot) {
    setSelectedSlotId(slot.id);
    const form = formRef.current;
    if (!form) return;

    const values = {
      appointmentDate: toDateInputValue(slot.startAt),
      appointmentTime: toTimeInputValue(slot.startAt),
      availabilitySlotId: slot.availabilitySlotId,
      branchId: slot.branchId ?? "",
      doctorId: slot.doctorId,
      durationMinutes: String(slot.durationMinutes),
    };

    for (const [name, value] of Object.entries(values)) {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
        field.value = value;
      }
    }
  }

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      if (!online) {
        await queueOfflineMutation(formData, "create");
        toast.success("Appointment saved offline. It will sync when internet is back.");
        formRef.current?.reset();
        setSelectedSlotId("");
        return;
      }

      const result = await action(formData);

      if (result.ok) {
        toast.success(result.message);
        formRef.current?.reset();
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  }

  function onFlowSubmit(formData: FormData) {
    startTransition(async () => {
      if (!online) {
        await queueOfflineMutation(formData, "update");
        toast.success("Flow update saved offline. It will sync when internet is back.");
        return;
      }

      const result = await action(formData);

      if (result.ok) {
        toast.success(result.message);
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  }

  const statCards = [
    { icon: CalendarDays, label: "Today", value: stats.today },
    { icon: ListChecks, label: "Pending", value: stats.pendingConfirmation },
    { icon: Ticket, label: "In queue", value: stats.checkedIn },
    { icon: Video, label: "Online", value: stats.onlineConsultations },
  ];

  const visibleSlots = calendarSlots.slice(0, 36);

  return (
    <DashboardShell breadcrumb={breadcrumb} title={title}>
      <AppointmentsToast />
      <div className="space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-2">
            <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={online ? "default" : "secondary"} className="gap-1.5">
                {online ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
                {online ? "Online booking" : "Offline booking"}
              </Badge>
              {offlineQueueCount > 0 ? (
                <Badge variant="outline">{offlineQueueCount} appointment sync pending</Badge>
              ) : null}
            </div>
          </div>

          <form action="/appointments" className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Input name="date" type="date" defaultValue={selectedDate} />
            <div className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-8"
                defaultValue={query}
                name="q"
                placeholder="Search patient, doctor, token"
                type="search"
              />
            </div>
            <Button type="submit" variant="outline">
              Filter
            </Button>
          </form>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {statCards.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{label}</p>
                <span className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <section className="grid gap-5 xl:grid-cols-[380px_1fr]">
          <form ref={formRef} action={onSubmit} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Plus className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold text-foreground">Book appointment</h2>
                <p className="text-sm text-muted-foreground">Create slots with queue tokens.</p>
              </div>
            </div>

            <div className="grid gap-3">
              <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-patient`}>
                Patient
                <select
                  id={`${fieldId}-patient`}
                  name="patientId"
                  required
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                  defaultValue=""
                >
                  <option value="">Select patient</option>
                  {patientOptions.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.label} - {patient.phone}
                    </option>
                  ))}
                </select>
              </label>

              <input name="availabilitySlotId" type="hidden" />

              <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-doctor`}>
                Doctor
                <select
                  id={`${fieldId}-doctor`}
                  name="doctorId"
                  required
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                  defaultValue={doctorId}
                >
                  <option value="">Select doctor</option>
                  {doctorOptions.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.label}
                      {doctor.specialization ? ` - ${doctor.specialization}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-branch`}>
                Clinic / Branch
                <select
                  id={`${fieldId}-branch`}
                  name="branchId"
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                  defaultValue=""
                >
                  <option value="">Select branch</option>
                  {branchOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.label} ({branch.code})
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-date`}>
                  Date
                  <Input
                    id={`${fieldId}-date`}
                    name="appointmentDate"
                    required
                    type="date"
                    defaultValue={selectedDate}
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-time`}>
                  Time
                  <Input id={`${fieldId}-time`} name="appointmentTime" required type="time" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-duration`}>
                  Duration
                  <select
                    id={`${fieldId}-duration`}
                    name="durationMinutes"
                    className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                    defaultValue="15"
                  >
                    {SLOT_DURATIONS.map((duration) => (
                      <option key={duration} value={duration}>
                        {duration} min
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-type`}>
                  Type
                  <select
                    id={`${fieldId}-type`}
                    name="appointmentType"
                    className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                    defaultValue="clinic"
                  >
                    <option value="clinic">Offline clinic visit</option>
                    <option value="online">Online consult</option>
                    <option value="hybrid">Online / offline flexible</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-status`}>
                  Status
                  <select
                    id={`${fieldId}-status`}
                    name="status"
                    className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                    defaultValue="booked"
                  >
                    {STATUS_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-priority`}>
                  Priority
                  <select
                    id={`${fieldId}-priority`}
                    name="priority"
                    className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                    defaultValue="normal"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="vip">VIP</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-reminder`}>
                Reminder
                <select
                  id={`${fieldId}-reminder`}
                  name="reminderChannel"
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                  defaultValue="whatsapp"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                  <option value="none">None</option>
                </select>
              </label>

              <label
                className="grid gap-1.5 text-sm font-medium"
                htmlFor={`${fieldId}-consultationLink`}
              >
                Online consultation link
                <Input
                  id={`${fieldId}-consultationLink`}
                  name="onlineConsultationLink"
                  placeholder="https://meet.example.com/consult"
                  type="url"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-recurrence`}>
                Recurring appointments
                <select
                  id={`${fieldId}-recurrence`}
                  name="recurrenceRule"
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                  defaultValue=""
                >
                  <option value="">One time</option>
                  <option value="FREQ=DAILY;COUNT=7">Daily for 7 visits</option>
                  <option value="FREQ=WEEKLY;COUNT=4">Weekly for 4 visits</option>
                  <option value="FREQ=MONTHLY;COUNT=3">Monthly for 3 visits</option>
                </select>
              </label>

              <label className="grid gap-1.5 text-sm font-medium" htmlFor={`${fieldId}-reason`}>
                Reason for visit
                <Textarea id={`${fieldId}-reason`} name="reason" rows={3} />
              </label>

              <Button type="submit" className="gap-2" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Create appointment
              </Button>
            </div>
          </form>

          <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold text-foreground">Smart calendar schedule</h2>
                <p className="text-sm text-muted-foreground">
                  Appointments are sorted by time with token and consultation details.
                </p>
              </div>

              <form action="/appointments" className="flex flex-wrap gap-2">
                <input type="hidden" name="date" value={selectedDate} />
                <select
                  name="doctorId"
                  defaultValue={doctorId}
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">All doctors</option>
                  {doctorOptions.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.label}
                    </option>
                  ))}
                </select>
                <select
                  name="status"
                  defaultValue={status}
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">All statuses</option>
                  {STATUS_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <Button type="submit" variant="outline">
                  Apply
                </Button>
              </form>
            </div>

            <div className="border-b p-4">
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Doctor availability slots</h3>
                  <p className="text-sm text-muted-foreground">
                    Pick a slot to fill the doctor, date, time, branch, and duration.
                  </p>
                </div>
                <Badge variant="outline">{calendarSlots.length} slots</Badge>
              </div>

              {visibleSlots.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {visibleSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot.id}
                      onClick={() => fillSlot(slot)}
                      disabled={!slot.available}
                      className={`rounded-lg border p-3 text-left text-sm transition ${
                        selectedSlotId === slot.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:border-primary/50"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <span className="flex items-center justify-between gap-2 font-medium">
                        {formatTimeRange(slot.startAt, slot.endAt)}
                        <Badge variant={slot.available ? "outline" : "secondary"}>
                          {slot.booked}/{slot.capacity}
                        </Badge>
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {slot.doctorName}
                        {slot.branchName ? ` - ${slot.branchName}` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No availability slots are configured for this date. Select a doctor/date with
                  slots or create the appointment manually.
                </div>
              )}
            </div>

            {appointments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Queue</TableHead>
                    <TableHead>Reminder</TableHead>
                    <TableHead>Consult</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="grid gap-1">
                          <span className="inline-flex items-center gap-2 font-medium">
                            <Clock3 className="size-3.5" />
                            {formatTimeRange(appointment.startAt, appointment.endAt)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {appointment.appointmentNumber}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="grid gap-1">
                          <span className="inline-flex items-center gap-2 font-medium">
                            <UserRoundCheck className="size-3.5" />
                            {appointment.patientName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {appointment.patientPhone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="grid gap-1">
                          <span className="font-medium">{appointment.doctorName}</span>
                          <span className="text-xs text-muted-foreground">
                            {appointment.doctorSpecialization ??
                              appointment.branchName ??
                              "General"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <form action={onFlowSubmit} className="flex items-center gap-2">
                          <input type="hidden" name="_intent" value="update-flow" />
                          <input type="hidden" name="appointmentId" value={appointment.id} />
                          <input type="hidden" name="queueStatus" value={appointment.queueStatus} />
                          <select
                            name="status"
                            defaultValue={appointment.status}
                            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                            aria-label="Appointment status"
                          >
                            {STATUS_OPTIONS.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                          <Button size="sm" variant="outline">
                            Save
                          </Button>
                        </form>
                      </TableCell>
                      <TableCell>
                        <form action={onFlowSubmit} className="grid gap-1">
                          <input type="hidden" name="_intent" value="update-flow" />
                          <input type="hidden" name="appointmentId" value={appointment.id} />
                          <input type="hidden" name="status" value={appointment.status} />
                          <Badge variant="outline">Token {appointment.tokenNumber ?? "-"}</Badge>
                          <select
                            name="queueStatus"
                            defaultValue={appointment.queueStatus}
                            className="h-8 rounded-md border border-input bg-background px-2 text-xs capitalize"
                            aria-label="Queue status"
                          >
                            {["not_checked_in", "waiting", "called", "skipped", "completed"].map(
                              (item) => (
                                <option key={item} value={item}>
                                  {item.replaceAll("_", " ")}
                                </option>
                              ),
                            )}
                          </select>
                          <Button size="sm" variant="outline">
                            Update
                          </Button>
                        </form>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2 text-sm capitalize text-muted-foreground">
                          <MessageSquareText className="size-3.5" />
                          {appointment.reminderChannel} / {appointment.reminderStatus}
                        </span>
                      </TableCell>
                      <TableCell>
                        {appointment.onlineConsultationLink ? (
                          <Button asChild size="sm" variant="outline" className="gap-2">
                            <a
                              href={appointment.onlineConsultationLink}
                              target="_blank"
                              rel="noopener"
                            >
                              <LinkIcon className="size-3.5" />
                              Join
                            </a>
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {formatDateTime(appointment.createdAt)}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="grid min-h-72 place-items-center p-6 text-center">
                <div>
                  <CalendarDays className="mx-auto size-10 text-muted-foreground" />
                  <h3 className="mt-3 font-medium text-foreground">No appointments found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Book an appointment or change the current date and filters.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
