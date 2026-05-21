import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { appointmentsPageController } from "@modules/appointments/controllers/appointment.controller";
import { AppointmentsCalendarView } from "@modules/appointments/views/appointments-calendar-view";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Appointments | MediClinic Pro",
    description: "Doctor-wise appointment calendar, booking, details, rescheduling, and cancellations."
  };
}

export default async function AppointmentsPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const session = await requirePagePermission("appointments.view");
  const params = await searchParams;
  const data = await appointmentsPageController({ branchId: session.branchId, selectedDate: params.date });
  return <AppointmentsCalendarView data={data} />;
}
