"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cancelAppointmentAction, rescheduleAppointmentAction, updateAppointmentStatusAction } from "../actions/appointment.actions";
import type { CalendarAppointment } from "../types/appointment.types";
import { AppointmentStatusBadge } from "./appointment-status-badge";

export function AppointmentDetailsModal({
  appointment,
  open,
  onOpenChange,
  statusOptions
}: {
  appointment: CalendarAppointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statusOptions: Array<{ value: string; label: string }>;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  if (!appointment) return null;

  function run(action: (formData: FormData) => Promise<{ ok: boolean; message: string }>, formData: FormData) {
    startTransition(() => {
      void action(formData).then((result) => {
        setMessage(result.message);
        if (result.ok) onOpenChange(false);
      });
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Appointment Details</DialogTitle></DialogHeader>
        <div className="space-y-5">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{appointment.patientName}</p>
                <p className="text-sm text-muted-foreground">{appointment.bookingNumber}</p>
              </div>
              <AppointmentStatusBadge status={appointment.status} />
            </div>
            <p className="mt-3 text-sm">{appointment.reasonForVisit}</p>
            <p className="mt-1 text-sm text-muted-foreground">Dr. {appointment.doctorName} · {appointment.appointmentDate} · {appointment.startTime}-{appointment.endTime}</p>
          </div>

          <form action={(formData) => run(updateAppointmentStatusAction, formData)} className="grid gap-3 md:grid-cols-[1fr_auto]">
            <input type="hidden" name="id" value={appointment.id} />
            <Select name="status" defaultValue={appointment.status}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
            <Button type="submit" disabled={pending}>Update Status</Button>
          </form>

          <form action={(formData) => run(rescheduleAppointmentAction, formData)} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
            <input type="hidden" name="id" value={appointment.id} />
            <Input name="appointmentDate" type="date" defaultValue={appointment.appointmentDate} />
            <Input name="startTime" type="time" defaultValue={appointment.startTime} />
            <Input name="durationMinutes" type="number" defaultValue={appointment.durationMinutes} />
            <Button type="submit" variant="outline" disabled={pending}>Reschedule</Button>
          </form>

          <form action={(formData) => run(cancelAppointmentAction, formData)} className="grid gap-3">
            <input type="hidden" name="id" value={appointment.id} />
            <Textarea name="cancelledReason" placeholder="Cancellation reason" defaultValue={appointment.cancelledReason ?? ""} />
            <Button type="submit" variant="destructive" disabled={pending}>Cancel Appointment</Button>
          </form>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
