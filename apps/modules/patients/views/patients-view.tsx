export { PatientsListView, PatientsView } from "./patients-list-view";
export { PatientDetailsView, PatientDetailView } from "./patient-details-view";

function PlaceholderPatientSubView({ title, patientId }: { title: string; patientId: string }) {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">Patient ID: {patientId}</p>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">No records found.</div>
    </section>
  );
}

export function PatientTimelineView({ patientId }: { patientId: string }) {
  return <PlaceholderPatientSubView title="Patient Timeline" patientId={patientId} />;
}

export function PatientDocumentsView({ patientId }: { patientId: string }) {
  return <PlaceholderPatientSubView title="Patient Documents" patientId={patientId} />;
}

export function PatientNotesView({ patientId }: { patientId: string }) {
  return <PlaceholderPatientSubView title="Patient Notes" patientId={patientId} />;
}

export function PatientBillingView({ patientId }: { patientId: string }) {
  return <PlaceholderPatientSubView title="Patient Billing" patientId={patientId} />;
}
