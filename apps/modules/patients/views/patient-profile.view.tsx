import Link from "next/link";
import type { Role } from "@mediclinic/rbac";
import { can } from "@mediclinic/rbac";
import { Bot, CalendarClock, CreditCard, FileText, HeartPulse, IdCard, NotebookText, Shield, Upload, UsersRound } from "lucide-react";
import { patientAge } from "../utils/patient-age";

type PatientProfileViewProps = {
  profile: any;
  role: Role;
  section?: "overview" | "timeline" | "documents" | "billing" | "appointments" | "notes";
};

function patientName(patient: { firstName: string; lastName: string }) {
  return `${patient.firstName} ${patient.lastName}`.trim();
}

function dateLabel(value: string | Date | null | undefined) {
  return value ? new Date(value).toLocaleDateString() : "Not recorded";
}

function money(value: string | number | null | undefined) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">{children}</span>;
}

function Card({ title, icon: Icon, children }: { title: string; icon: typeof IdCard; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950"><Icon className="h-5 w-5 text-primary" aria-hidden /> {title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function PatientProfileView({ profile, role, section = "overview" }: PatientProfileViewProps) {
  const { patient } = profile;
  const tabs = [
    ["overview", "Overview", `/patients/${patient.id}`],
    ["timeline", "Timeline", `/patients/${patient.id}/timeline`],
    ["documents", "Documents", `/patients/${patient.id}/documents`],
    ["billing", "Billing", `/patients/${patient.id}/billing`],
    ["appointments", "Appointments", `/patients/${patient.id}/appointments`],
    ["notes", "Notes", `/doctor/patients/${patient.id}/notes`]
  ] as const;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-700">{patient.mrn}</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-950">{patientName(patient)}</h1>
            <p className="mt-2 text-sm text-slate-600">{patient.sex} · {patientAge(patient.dateOfBirth)} yrs · DOB {dateLabel(patient.dateOfBirth)} · {patient.phone}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{patient.isActive ? "Active" : "Inactive"}</Badge>
              {patient.consentOnFile ? <Badge>Consent on file</Badge> : <Badge>Consent needed</Badge>}
              {patient.preferredLanguage ? <Badge>{patient.preferredLanguage}</Badge> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/patients/${patient.id}/edit` as any} className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700">Edit</Link>
            <Link href="/patients" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Back to patients</Link>
          </div>
        </div>
        <nav className="mt-6 flex flex-wrap gap-2">
          {tabs.map(([id, label, href]) => (
            <Link key={id} href={href as any} className={`rounded-lg px-3 py-2 text-sm font-semibold ${section === id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>{label}</Link>
          ))}
        </nav>
      </div>

      {section === "overview" ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="grid gap-6">
            <Card title="Basic Information" icon={IdCard}>
              <dl className="grid gap-3 md:grid-cols-2 text-sm">
                <div><dt className="text-slate-500">Email</dt><dd className="font-semibold">{patient.email || "Not recorded"}</dd></div>
                <div><dt className="text-slate-500">Blood group</dt><dd className="font-semibold">{patient.bloodGroup || "Not recorded"}</dd></div>
                <div><dt className="text-slate-500">Occupation</dt><dd className="font-semibold">{patient.occupation || "Not recorded"}</dd></div>
                <div><dt className="text-slate-500">Address</dt><dd className="font-semibold">{patient.address ? `${patient.address.line1}, ${patient.address.city}, ${patient.address.state} ${patient.address.postalCode}` : "Not recorded"}</dd></div>
              </dl>
            </Card>

            {can(role, "patients.medical.view") ? (
              <Card title="Medical History" icon={HeartPulse}>
                <div className="grid gap-3">
                  {profile.medicalHistory.map((item: any) => <div key={item.id} className="rounded-lg border bg-white p-3"><p className="font-semibold">{item.conditionName}</p><p className="text-sm text-slate-500">{item.status} · {item.severity || "severity not recorded"} · {dateLabel(item.diagnosisDate)}</p><p className="mt-2 text-sm">{item.notes}</p></div>)}
                  {profile.medicalHistory.length === 0 ? <p className="text-sm text-slate-500">No medical history recorded.</p> : null}
                </div>
              </Card>
            ) : null}

            <Card title="Emergency Contacts and Family" icon={UsersRound}>
              <div className="grid gap-3 md:grid-cols-2">
                {[...profile.emergencyContacts, ...profile.familyMembers].map((item: any) => <div key={item.id} className="rounded-lg border bg-white p-3"><p className="font-semibold">{item.name}</p><p className="text-sm text-slate-500">{item.relationship} · {item.phone || "No phone"}</p></div>)}
              </div>
            </Card>
          </div>

          <div className="grid gap-6">
            {can(role, "patients.insurance.view") ? (
              <Card title="Insurance" icon={Shield}>
                {profile.insurancePolicies.map((item: any) => <div key={item.id} className="rounded-lg border bg-white p-3 text-sm"><p className="font-semibold">{item.payerName}</p><p className="text-slate-500">{item.memberId} · {item.verificationStatus}</p></div>)}
              </Card>
            ) : null}
            {can(role, "patients.ai.view") ? (
              <Card title="AI Summary" icon={Bot}>
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">AI output is suggestion-only and requires doctor/admin approval before being saved as care guidance.</p>
                <div className="mt-3 grid gap-3">
                  {profile.aiSummaries.map((item: any) => <pre key={item.id} className="whitespace-pre-wrap rounded-lg border bg-white p-3 text-xs text-slate-700">{item.summary}</pre>)}
                  {profile.aiSummaries.length === 0 ? <p className="text-sm text-slate-500">No AI summaries generated.</p> : null}
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      ) : null}

      {section === "timeline" ? <TimelineSection events={profile.timeline} /> : null}
      {section === "documents" ? <DocumentsSection documents={profile.documents} /> : null}
      {section === "billing" ? <BillingSection invoices={profile.billingHistory} payments={profile.payments} /> : null}
      {section === "appointments" ? <AppointmentsSection appointments={profile.appointmentHistory} /> : null}
      {section === "notes" ? <NotesSection notes={profile.notes} /> : null}
    </section>
  );
}

function TimelineSection({ events }: { events: any[] }) {
  return <Card title="Timeline" icon={CalendarClock}><div className="grid gap-3">{events.map((event) => <div key={event.id} className="rounded-lg border bg-white p-4"><p className="font-semibold">{event.title}</p><p className="text-xs text-slate-500">{event.eventType} · {dateLabel(event.occurredAt)}</p><p className="mt-2 text-sm">{event.description}</p></div>)}</div></Card>;
}

function DocumentsSection({ documents }: { documents: any[] }) {
  return <Card title="Documents" icon={Upload}><div className="grid gap-3 md:grid-cols-2">{documents.map((document) => <div key={document.id} className="rounded-lg border bg-white p-4"><p className="font-semibold">{document.title}</p><p className="text-sm text-slate-500">{document.documentType} · {document.mimeType} · {document.fileName}</p><p className="mt-2 text-xs text-slate-500">{document.storageKey}</p></div>)}</div></Card>;
}

function BillingSection({ invoices, payments }: { invoices: any[]; payments: any[] }) {
  return <Card title="Billing History" icon={CreditCard}><div className="grid gap-3">{invoices.map((invoice) => <div key={invoice.id} className="rounded-lg border bg-white p-4"><p className="font-semibold">{invoice.invoiceNumber || invoice.id}</p><p className="text-sm text-slate-500">{invoice.status} · Total {money(invoice.total)} · Paid {money(invoice.amountPaid)} · Due {money(invoice.balanceDue)}</p></div>)}{payments.length ? <p className="text-sm text-slate-500">{payments.length} payment record(s) available.</p> : null}</div></Card>;
}

function AppointmentsSection({ appointments }: { appointments: any[] }) {
  return <Card title="Appointment History" icon={CalendarClock}><div className="grid gap-3">{appointments.map((appointment) => <div key={appointment.id} className="rounded-lg border bg-white p-4"><p className="font-semibold">{dateLabel(appointment.startsAt)} · {appointment.reason}</p><p className="text-sm text-slate-500">Dr. {appointment.doctorFirstName} {appointment.doctorLastName} · {appointment.departmentName || "Department not recorded"} · {appointment.status} · {appointment.consultationMode}</p></div>)}</div></Card>;
}

function NotesSection({ notes }: { notes: any[] }) {
  return <Card title="Notes" icon={NotebookText}><div className="grid gap-3">{notes.map((note) => <div key={note.id} className="rounded-lg border bg-white p-4"><p className="font-semibold">{note.title || "Untitled note"}</p><p className="text-xs text-slate-500">{note.noteType} · {note.visibility} · {dateLabel(note.createdAt)}</p><p className="mt-2 text-sm">{note.body}</p></div>)}</div></Card>;
}
