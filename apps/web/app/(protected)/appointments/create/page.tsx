import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { appointmentService } from "@modules/appointments/services/appointment.service";
import { AppointmentsCalendarView } from "@modules/appointments/views/appointments-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book Appointment | MediClinic Pro",
};

export default async function CreateAppointmentPage() {
  await requirePagePermission("appointments.create");
  const currentDate = new Date().toISOString().slice(0, 10);
  const [appointments, doctors, slots] = await Promise.all([
    appointmentService.list({ date: currentDate }),
    appointmentService.getDoctors(),
    Promise.resolve([]),
  ]);
  return <AppointmentsCalendarView appointments={appointments} doctors={doctors} currentDate={currentDate} slots={slots} />;
}
