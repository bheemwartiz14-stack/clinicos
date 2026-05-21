import { AppointmentStatusBadge } from "./appointment-status-badge";
import { MeetJoinButton } from "./meet-join-button";

export function AppointmentDetailDrawer({ appointment }: { appointment: any }) {
  return (
    <aside className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{appointment.patientName}</h2>
          <p className="text-sm text-muted-foreground">Dr. {appointment.doctorName}</p>
        </div>
        <AppointmentStatusBadge status={appointment.status} />
      </div>
      <p className="mt-4 text-sm">{appointment.reasonForVisit}</p>
      <div className="mt-4"><MeetJoinButton href={appointment.googleMeetLink ?? appointment.meetingUrl} /></div>
    </aside>
  );
}
