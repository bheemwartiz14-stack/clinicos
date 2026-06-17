import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { appointmentService } from "@modules/appointments/services/appointment.service";
import { AppointmentsCalendarView } from "@modules/appointments/views/appointments-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Appointments | MediClinic Pro"
};

export default async function AppointmentsPage({ searchParams }: { searchParams?: Promise<{ date?: string; doctorId?: string }> }) {
  await requirePagePermission("appointments.view");
  const params = searchParams ? await searchParams : {};

  const currentDate = params.date || new Date().toISOString().slice(0, 10);

  const doctors = await appointmentService.getDoctors();

  const [appointments, slots] = await Promise.all([
    appointmentService.list({
      date: currentDate,
      doctorId: params.doctorId || undefined,
    }),
    params.doctorId
      ? appointmentService.getAllSlots(params.doctorId, currentDate)
      : Promise.all(doctors.map((d) => appointmentService.getAllSlots(d.id, currentDate))).then(
          (results) => results.flat(),
        ),
  ]);

  return (
    <AppointmentsCalendarView
      appointments={appointments}
      doctors={doctors}
      currentDate={currentDate}
      slots={slots}
    />
  );
}
