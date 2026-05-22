"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle2, Clock, FileText, Hash, RefreshCw, Stethoscope, User, XCircle } from "lucide-react";
import { useState } from "react";
import { updateAppointmentStatusAction, rescheduleAppointmentAction } from "../actions/appointment.actions";
import type { AppointmentRecord } from "../services/appointment.service";
import { FormField, TextareaField } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  booked: { badge: "bg-blue-100 text-blue-800 border-blue-200", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  confirmed: { badge: "bg-emerald-100 text-emerald-800 border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  checked_in: { badge: "bg-violet-100 text-violet-800 border-violet-200", bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  in_consultation: { badge: "bg-amber-100 text-amber-800 border-amber-200", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  completed: { badge: "bg-green-100 text-green-800 border-green-200", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  cancelled: { badge: "bg-rose-100 text-rose-800 border-rose-200", bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  rescheduled: { badge: "bg-orange-100 text-orange-800 border-orange-200", bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  no_show: { badge: "bg-gray-100 text-gray-800 border-gray-200", bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" },
  pending: { badge: "bg-yellow-100 text-yellow-800 border-yellow-200", bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
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

export function AppointmentDetailView({ appointment }: { appointment: AppointmentRecord }) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const style = STATUS_STYLES[appointment.status] || STATUS_STYLES.pending;

  const actionButtons = [
    { label: "Check-in", status: "checked_in", show: appointment.status === "confirmed" || appointment.status === "booked", variant: "default" as const },
    { label: "Start Consultation", status: "in_consultation", show: appointment.status === "checked_in", variant: "secondary" as const },
    { label: "Mark Completed", status: "completed", show: appointment.status === "in_consultation" || appointment.status === "checked_in", variant: "secondary" as const },
    { label: "No Show", status: "no_show", show: appointment.status !== "completed" && appointment.status !== "cancelled" && appointment.status !== "no_show", variant: "outline" as const },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/[0.07] via-transparent to-background p-6">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="h-9 w-9 shrink-0">
              <Link href="/appointments">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold text-white shadow-lg ${avatarColor(appointment.patientName)}`}>
                {getInitials(appointment.patientName)}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{appointment.patientName}</h1>
                  <Badge className={style.badge}>
                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {appointment.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{appointment.patientPhone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-lg border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4 text-primary" />
              Patient Info
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            <div className="flex justify-between px-5 py-3.5 text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{appointment.patientName}</span>
            </div>
            <div className="flex justify-between px-5 py-3.5 text-sm">
              <span className="text-muted-foreground">Phone</span>
              <span>{appointment.patientPhone}</span>
            </div>
            {appointment.reason && (
              <div className="flex justify-between px-5 py-3.5 text-sm">
                <span className="text-muted-foreground">Reason</span>
                <span className="max-w-[180px] text-right">{appointment.reason}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Stethoscope className="h-4 w-4 text-emerald-600" />
              Doctor
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            <div className="flex justify-between px-5 py-3.5 text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{appointment.doctorName}</span>
            </div>
            <div className="flex justify-between px-5 py-3.5 text-sm">
              <span className="text-muted-foreground">Specialty</span>
              <span>{appointment.doctorSpecialty ?? "General"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Calendar className="h-4 w-4 text-violet-600" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            <div className="flex justify-between px-5 py-3.5 text-sm">
              <span className="text-muted-foreground">Date & Time</span>
              <span className="font-medium">{appointment.appointmentDate} · {formatTime(appointment.startTime)}</span>
            </div>
            <div className="flex justify-between px-5 py-3.5 text-sm">
              <span className="text-muted-foreground">Type</span>
              <Badge variant="outline" className="capitalize">{appointment.type.replace("_", " ")}</Badge>
            </div>
            {appointment.queueTokenNumber && (
              <div className="flex justify-between px-5 py-3.5 text-sm">
                <span className="text-muted-foreground">Token #</span>
                <span className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-lg font-bold">{String(appointment.queueTokenNumber).padStart(2, "0")}</span>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold">Actions</CardTitle>
          <CardDescription>Manage appointment status, reschedule, or cancel.</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex flex-wrap gap-2">
            {actionButtons.map((btn) =>
              btn.show && (
                <form key={btn.status} action={updateAppointmentStatusAction}>
                  <input type="hidden" name="appointmentId" value={appointment.id} />
                  <input type="hidden" name="newStatus" value={btn.status} />
                  <Button type="submit" variant={btn.variant}>
                    {btn.status === "checked_in" && <CheckCircle2 className="mr-1.5 h-4 w-4" />}
                    {btn.label}
                  </Button>
                </form>
              )
            )}

            <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={appointment.status === "completed" || appointment.status === "cancelled"}
                  className="gap-1.5"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reschedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reschedule Appointment</DialogTitle>
                  <DialogDescription>Select a new date and time for this appointment.</DialogDescription>
                </DialogHeader>
                <form
                  action={rescheduleAppointmentAction}
                  onSubmit={() => setTimeout(() => setRescheduleOpen(false), 100)}
                  className="grid gap-4"
                >
                  <input type="hidden" name="appointmentId" value={appointment.id} />
                  <FormField label="New Date" name="newDate" type="date" required />
                  <FormField label="New Time" name="newStartTime" type="time" required />
                  <TextareaField label="Reason for reschedule" name="reason" rows={2} />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setRescheduleOpen(false)}>Cancel</Button>
                    <Button type="submit">Confirm Reschedule</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <form
              action={updateAppointmentStatusAction}
              onSubmit={(e) => {
                if (!confirm("Are you sure you want to cancel this appointment?")) e.preventDefault();
              }}
            >
              <input type="hidden" name="appointmentId" value={appointment.id} />
              <input type="hidden" name="newStatus" value="cancelled" />
              <Button
                type="submit"
                variant="destructive"
                disabled={appointment.status === "completed" || appointment.status === "cancelled"}
                className="gap-1.5"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {appointment.notes && (
        <Card className="rounded-lg border-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-amber-600" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <p className="text-sm leading-relaxed">{appointment.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
