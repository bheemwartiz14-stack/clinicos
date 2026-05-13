import {
  type AppointmentsPageSearchParams,
  appointmentsPageController,
  createAppointmentAction,
} from "@/modules/appointments";
import { AppointmentsView } from "@/modules/appointments/views/appointments.view";

type AppointmentsPageProps = {
  searchParams: Promise<AppointmentsPageSearchParams>;
};

export default async function AppointmentsPage({ searchParams }: AppointmentsPageProps) {
  const model = await appointmentsPageController(searchParams);

  return <AppointmentsView {...model} action={createAppointmentAction} />;
}
