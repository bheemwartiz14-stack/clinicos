import type { AppointmentRecord } from "../types/appointment.types";
import { AppointmentDetailDrawer } from "../components/appointment-detail-drawer";
import { AppointmentNotesPanel } from "../components/appointment-notes-panel";
import { AppointmentTimeline } from "../components/appointment-timeline";

type AppointmentDetailViewProps = {
  detail: {
    appointment: AppointmentRecord;
    timeline: Array<{ id: string; newStatus: string; changedAt: Date | string; reason?: string | null }>;
    notes: Array<{ id: string; body: string; createdAt: Date | string }>;
    prediction: { noShowRiskScore: string; riskLevel: string; recommendedReminderFrequency: string } | null;
  };
};

export function AppointmentDetailView({ detail }: AppointmentDetailViewProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="grid gap-6">
        <AppointmentDetailDrawer appointment={detail.appointment} />
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Status timeline</h2>
          <div className="mt-4"><AppointmentTimeline events={detail.timeline} /></div>
        </section>
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Appointment notes</h2>
          <div className="mt-4"><AppointmentNotesPanel notes={detail.notes} /></div>
        </section>
      </div>
      <aside className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold">AI prediction</h2>
        {detail.prediction ? (
          <div className="mt-4 grid gap-3 text-sm">
            <p>Risk level: <span className="font-semibold capitalize">{detail.prediction.riskLevel}</span></p>
            <p>Score: <span className="font-semibold">{detail.prediction.noShowRiskScore}</span></p>
            <p>Reminders: <span className="font-semibold">{detail.prediction.recommendedReminderFrequency}</span></p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No AI prediction stored yet.</p>
        )}
      </aside>
    </section>
  );
}
