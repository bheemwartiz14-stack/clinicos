"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Bot, FileImage, FileText, HeartPulse, History, IdCard, Plus, Search, ShieldCheck, Upload, UsersRound } from "lucide-react";
import { DatePickerField, Select2Field } from "@/components/form-controls";
import { createPatientAction, type PatientActionState } from "../actions/patient.actions";
import type { PatientRecord } from "../types/patient.types";

const initialState: PatientActionState = { ok: false, message: "" };

function fieldError(state: PatientActionState, field: string) {
  return state.fieldErrors?.[field]?.[0];
}

function patientName(patient: PatientRecord) {
  return `${patient.firstName} ${patient.lastName}`;
}

function ageLabel(dateOfBirth: string) {
  const dob = new Date(dateOfBirth);
  const age = new Date().getFullYear() - dob.getFullYear();
  return `${age} yrs`;
}

function TextField({ label, name, type = "text", error, required }: { label: string; name: string; type?: string; error?: string; required?: boolean }) {
  if (type === "date" || type === "time") {
    return <DatePickerField label={label} name={name} type={type} error={error} required={required} />;
  }

  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-slate-800">{label}{required ? <span className="ml-1 text-rose-500">*</span> : null}</span>
      <input name={name} type={type} required={required} className="h-10 rounded-lg border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
      {error ? <span className="text-xs font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}

function TextArea({ label, name }: { label: string; name: string }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-slate-800">{label}</span>
      <textarea name={name} rows={3} className="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
    </label>
  );
}

function QuickRegistrationForm() {
  const [state, action, pending] = useActionState(createPatientAction, initialState);

  return (
    <form action={action} className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <Plus className="h-4 w-4 text-primary" aria-hidden />
        <h2 className="text-lg font-semibold">Quick patient registration</h2>
      </div>
      {state.message ? (
        <p className={`mt-3 rounded-lg px-3 py-2 text-sm font-medium ${state.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{state.message}</p>
      ) : null}

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <TextField label="First name" name="firstName" error={fieldError(state, "firstName")} required />
        <TextField label="Last name" name="lastName" error={fieldError(state, "lastName")} required />
        <DatePickerField label="Date of birth" name="dateOfBirth" type="date" error={fieldError(state, "dateOfBirth")} required />
        <Select2Field label="Sex" name="sex" error={fieldError(state, "sex")} required>
          <option value="">Select sex</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
          <option value="unknown">Unknown</option>
        </Select2Field>
        <TextField label="Phone" name="phone" type="tel" error={fieldError(state, "phone")} required />
        <TextField label="Email" name="email" type="email" error={fieldError(state, "email")} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-5">
        <TextField label="Address line 1" name="addressLine1" />
        <TextField label="Address line 2" name="addressLine2" />
        <TextField label="City" name="city" />
        <TextField label="State" name="state" />
        <TextField label="ZIP" name="postalCode" />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <TextField label="Emergency contact" name="emergencyContactName" />
        <TextField label="Emergency phone" name="emergencyContactPhone" />
        <Select2Field label="Relationship" name="emergencyContactRelationship">
          <option value="">Select relationship</option>
          <option value="spouse">Spouse</option>
          <option value="parent">Parent</option>
          <option value="child">Child</option>
          <option value="sibling">Sibling</option>
          <option value="guardian">Guardian</option>
          <option value="friend">Friend</option>
          <option value="other">Other</option>
        </Select2Field>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <TextField label="Insurance payer" name="insurancePayer" />
        <TextField label="Member ID" name="insuranceMemberId" />
        <TextField label="Group ID" name="insuranceGroupId" />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <TextArea label="Allergies" name="allergies" />
        <TextArea label="Medications" name="medications" />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <label className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium">
          <input name="consentOnFile" type="checkbox" className="h-4 w-4 accent-teal-700" />
          Consent on file
        </label>
        <label className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium">
          <input name="portalAccess" type="checkbox" className="h-4 w-4 accent-teal-700" />
          Create patient portal login
        </label>
        <TextField label="Portal password" name="portalPassword" type="password" error={fieldError(state, "portalPassword")} />
      </div>

      <div className="mt-5 flex justify-end">
        <button disabled={pending} className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {pending ? "Registering..." : "Register patient"}
        </button>
      </div>
    </form>
  );
}

export function PatientsView({ patients }: { patients: PatientRecord[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    if (!needle) return patients;
    return patients.filter((patient) => [patientName(patient), patient.mrn, patient.phone, patient.email ?? "", patient.insurance?.payer ?? ""].some((value) => value.toLowerCase().includes(needle)));
  }, [patients, query]);
  const selected = filtered[0] ?? patients[0] ?? null;

  return (
    <section className="space-y-6">
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Patient Management</h1>
            <p className="mt-2 text-sm text-slate-600">Admin and clinic staff manage patient registration, charts, documents, history, billing, and portal access.</p>
          </div>
          <Link href="/patients/create" className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Create patient</Link>
        </div>
      </div>

      <QuickRegistrationForm />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="rounded-xl border bg-card p-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, MRN, phone, email, insurance" className="h-11 w-full rounded-lg border bg-white pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </label>
          <div className="mt-4 grid gap-2">
            {filtered.map((patient) => (
              <Link key={patient.id} href={`/patients/${patient.id}` as any} className="block rounded-lg border bg-white p-3 transition hover:border-teal-200 hover:bg-teal-50/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{patientName(patient)}</p>
                    <p className="mt-1 text-xs text-slate-500">{patient.mrn} · {ageLabel(patient.dateOfBirth)} · {patient.sex}</p>
                  </div>
                  <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">{patient.userId ? "Portal" : "Chart"}</span>
                </div>
              </Link>
            ))}
            {filtered.length === 0 ? <p className="rounded-lg border border-dashed p-4 text-sm text-slate-500">No patients found.</p> : null}
          </div>
        </div>

        {selected ? (
          <div className="grid gap-5">
            <section className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{patientName(selected)}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{selected.mrn} · DOB {selected.dateOfBirth} · {selected.phone}</p>
                </div>
                <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold">{selected.consentOnFile ? "Consent complete" : "Consent needed"}</span>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-white p-4"><IdCard className="mb-2 h-4 w-4 text-primary" /><p className="text-xs text-slate-500">Insurance</p><p className="font-semibold">{selected.insurance?.payer ?? "Self pay / not recorded"}</p></div>
                <div className="rounded-lg border bg-white p-4"><HeartPulse className="mb-2 h-4 w-4 text-primary" /><p className="text-xs text-slate-500">Allergies</p><p className="font-semibold">{selected.allergies || "None recorded"}</p></div>
                <div className="rounded-lg border bg-white p-4"><ShieldCheck className="mb-2 h-4 w-4 text-primary" /><p className="text-xs text-slate-500">Emergency contact</p><p className="font-semibold">{selected.emergencyContact?.name ?? "Not recorded"}</p></div>
              </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-xl border bg-card p-5">
                <h3 className="flex items-center gap-2 font-semibold"><History className="h-4 w-4 text-primary" /> Timeline view</h3>
                <div className="mt-4 grid gap-3 text-sm">
                  <p className="rounded-lg border bg-white p-3">Registered on {new Date(selected.createdAt).toLocaleDateString()}</p>
                  <p className="rounded-lg border bg-white p-3">Appointment history and billing history populate from appointments and invoices.</p>
                  <p className="rounded-lg border bg-white p-3">Medical history, notes, and family members are ready for dedicated chart tables.</p>
                </div>
              </section>
              <section className="rounded-xl border bg-card p-5">
                <h3 className="flex items-center gap-2 font-semibold"><Upload className="h-4 w-4 text-primary" /> Patient documents</h3>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {["Reports", "Prescriptions", "Scans", "PDFs", "Images"].map((item) => (
                    <div key={item} className="rounded-lg border bg-white p-3 font-medium">{item === "Images" ? <FileImage className="mb-2 h-4 w-4 text-primary" /> : <FileText className="mb-2 h-4 w-4 text-primary" />}{item}</div>
                  ))}
                </div>
              </section>
            </div>

            <section className="rounded-xl border bg-card p-5">
              <h3 className="flex items-center gap-2 font-semibold"><Bot className="h-4 w-4 text-primary" /> AI patient workflows</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border bg-white p-4"><p className="font-semibold">AI patient search</p><p className="mt-2 text-sm text-slate-600">Search by clinical context, MRN, demographics, or insurance hints.</p></div>
                <div className="rounded-lg border bg-white p-4"><p className="font-semibold">AI summaries</p><p className="mt-2 text-sm text-slate-600">Summarize history, meds, allergies, notes, appointments, and documents.</p></div>
                <div className="rounded-lg border bg-white p-4"><p className="font-semibold">Follow-up suggestions</p><p className="mt-2 text-sm text-slate-600">Suggest callbacks, visits, reminders, and care gaps.</p></div>
              </div>
            </section>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-slate-500">Register a patient to start managing their profile.</div>
        )}
      </div>
    </section>
  );
}
