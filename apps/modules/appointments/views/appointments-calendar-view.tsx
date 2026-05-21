"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentCalendarGrid } from "../components/appointment-calendar-grid";
import { AppointmentDetailsModal } from "../components/appointment-details-modal";
import { AppointmentEmptyState } from "../components/appointment-empty-state";
import { AppointmentFilters } from "../components/appointment-filters";
import { NewBookingModal } from "../components/new-booking-modal";
import type { AppointmentsCalendarData, CalendarAppointment } from "../types/appointment.types";

export function AppointmentsCalendarView({ data }: { data: AppointmentsCalendarData }) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
  const [prefill, setPrefill] = useState<{ doctorId?: string; appointmentDate: string; startTime?: string }>({ appointmentDate: data.selectedDate });

  function openSlot(doctorId?: string, startTime?: string) {
    setPrefill({ doctorId, startTime, appointmentDate: data.selectedDate });
    setBookingOpen(true);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Appointments</h1>
          <p className="mt-2 text-sm text-muted-foreground">Doctor-wise calendar for booking, rescheduling, cancellation, and patient check-in flow.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <AppointmentFilters selectedDate={data.selectedDate} />
          <Button onClick={() => openSlot()}>
            <CalendarPlus className="mr-2 h-4 w-4" aria-hidden />
            New Booking
          </Button>
        </div>
      </div>

      <Card className="border-primary/10 bg-gradient-to-br from-card to-primary/5">
        <CardContent className="grid gap-4 p-4 md:grid-cols-3">
          <div className="rounded-lg bg-background p-4"><p className="text-sm text-muted-foreground">Doctors available</p><p className="mt-1 text-2xl font-semibold">{data.doctors.length}</p></div>
          <div className="rounded-lg bg-background p-4"><p className="text-sm text-muted-foreground">Appointments today</p><p className="mt-1 text-2xl font-semibold">{data.appointments.length}</p></div>
          <div className="rounded-lg bg-background p-4"><p className="text-sm text-muted-foreground">Checked in</p><p className="mt-1 text-2xl font-semibold">{data.appointments.filter((appointment) => appointment.status === "checked_in").length}</p></div>
        </CardContent>
      </Card>

      {data.doctors.length === 0 ? (
        <AppointmentEmptyState onCreate={() => openSlot()} />
      ) : (
        <AppointmentCalendarGrid
          doctors={data.doctors}
          appointments={data.appointments}
          timeSlots={data.timeSlots}
          onEmptySlot={(doctorId, time) => openSlot(doctorId, time)}
          onAppointment={(appointment) => {
            setSelectedAppointment(appointment);
            setDetailsOpen(true);
          }}
        />
      )}

      <NewBookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        doctors={data.doctors}
        patients={data.patients}
        prefill={prefill}
        statusOptions={data.statusOptions}
        typeOptions={data.typeOptions}
      />
      <AppointmentDetailsModal appointment={selectedAppointment} open={detailsOpen} onOpenChange={setDetailsOpen} statusOptions={data.statusOptions} />
    </section>
  );
}
