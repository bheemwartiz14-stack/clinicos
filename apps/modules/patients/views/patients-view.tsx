"use client";

import { useState } from "react";
import Link from "next/link";
import { User, FileText, Calendar, CreditCard, Clock, Phone, Mail } from "lucide-react";
import { cn } from "@mediclinic/ui";
import { StatusBadge } from "@/components/enterprise-ui";
import type { PatientRecord } from "../types/patient.types";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <User className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">No patients found</h3>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function PatientsView({ patients }: { patients: PatientRecord[] }) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? patients.filter((p) =>
        p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        p.firstName.toLowerCase().includes(search.toLowerCase()) ||
        p.lastName.toLowerCase().includes(search.toLowerCase()) ||
        p.mrn.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search)
      )
    : patients;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Patients</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage patient profiles, medical records, documents, and billing information.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Search by name, MRN, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 max-w-sm rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-semibold">Patient</th>
                  <th className="px-5 py-4 font-semibold">MRN</th>
                  <th className="px-5 py-4 font-semibold">Contact</th>
                  <th className="px-5 py-4 font-semibold">Demographics</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((patient) => (
                  <tr key={patient.id} className="transition hover:bg-muted/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-700">
                          <User className="h-5 w-5" aria-hidden />
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">{patient.fullName ?? `${patient.firstName} ${patient.lastName}`}</p>
                          <p className="mt-1 text-xs text-slate-500">ID: {patient.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm">{patient.mrn}</td>
                    <td className="px-5 py-4">
                      <p className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                        {patient.phone}
                      </p>
                      {patient.email && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="h-3 w-3 text-slate-400" aria-hidden />
                          {patient.email}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <p>{patient.sex}, {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                      {patient.bloodGroup && <p className="mt-1 text-xs">Blood: {patient.bloodGroup}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge tone={patient.isActive ? "success" : "neutral"}>
                        {patient.isActive ? "Active" : "Inactive"}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/patients/${patient.id}`} className="rounded-lg px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10">
                        View profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState message={search ? "No patients match your search criteria." : "No patients registered yet."} />
      )}
    </section>
  );
}

export function PatientDetailView({ patient }: { patient: PatientRecord }) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/patients" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700">
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{patient.fullName ?? `${patient.firstName} ${patient.lastName}`}</h1>
            <p className="mt-1 text-sm text-slate-500">MRN: {patient.mrn}</p>
          </div>
        </div>
        <StatusBadge tone={patient.isActive ? "success" : "neutral"}>{patient.isActive ? "Active" : "Inactive"}</StatusBadge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Contact Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-slate-400" aria-hidden />
              <span className="text-sm">{patient.phone}</span>
            </div>
            {patient.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" aria-hidden />
                <span className="text-sm">{patient.email}</span>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Demographics</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <p>Sex: {patient.sex}</p>
            <p>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
            {patient.bloodGroup && <p>Blood Group: {patient.bloodGroup}</p>}
            {patient.gender && <p>Gender: {patient.gender}</p>}
            {patient.maritalStatus && <p>Marital Status: {patient.maritalStatus}</p>}
            {patient.occupation && <p>Occupation: {patient.occupation}</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Link href={`/patients/${patient.id}/timeline`} className="flex items-center gap-3 rounded-xl border bg-card p-4 transition hover:bg-muted/40">
          <Clock className="h-5 w-5 text-primary" aria-hidden />
          <span className="font-medium">Timeline</span>
        </Link>
        <Link href={`/patients/${patient.id}/documents`} className="flex items-center gap-3 rounded-xl border bg-card p-4 transition hover:bg-muted/40">
          <FileText className="h-5 w-5 text-primary" aria-hidden />
          <span className="font-medium">Documents</span>
        </Link>
        <Link href={`/patients/${patient.id}/notes`} className="flex items-center gap-3 rounded-xl border bg-card p-4 transition hover:bg-muted/40">
          <FileText className="h-5 w-5 text-primary" aria-hidden />
          <span className="font-medium">Notes</span>
        </Link>
        <Link href={`/patients/${patient.id}/billing`} className="flex items-center gap-3 rounded-xl border bg-card p-4 transition hover:bg-muted/40">
          <CreditCard className="h-5 w-5 text-primary" aria-hidden />
          <span className="font-medium">Billing</span>
        </Link>
      </div>
    </section>
  );
}

export function PatientTimelineView({ patientId }: { patientId: string }) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/patients/${patientId}`} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Patient Timeline</h1>
          <p className="mt-1 text-sm text-slate-500">Activity history for this patient</p>
        </div>
      </div>
      <div className="rounded-xl border bg-card p-8 text-center text-slate-500">
        <Clock className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
        <p className="mt-4">No timeline events recorded.</p>
      </div>
    </section>
  );
}

export function PatientDocumentsView({ patientId }: { patientId: string }) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/patients/${patientId}`} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Patient Documents</h1>
          <p className="mt-1 text-sm text-slate-500">Uploaded documents and files</p>
        </div>
      </div>
      <div className="rounded-xl border bg-card p-8 text-center text-slate-500">
        <FileText className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
        <p className="mt-4">No documents uploaded.</p>
      </div>
    </section>
  );
}

export function PatientNotesView({ patientId }: { patientId: string }) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/patients/${patientId}`} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Patient Notes</h1>
          <p className="mt-1 text-sm text-slate-500">Clinical notes and observations</p>
        </div>
      </div>
      <div className="rounded-xl border bg-card p-8 text-center text-slate-500">
        <FileText className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
        <p className="mt-4">No notes recorded.</p>
      </div>
    </section>
  );
}

export function PatientBillingView({ patientId }: { patientId: string }) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/patients/${patientId}`} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Patient Billing</h1>
          <p className="mt-1 text-sm text-slate-500">Invoices, payments, and insurance</p>
        </div>
      </div>
      <div className="rounded-xl border bg-card p-8 text-center text-slate-500">
        <CreditCard className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
        <p className="mt-4">No billing records found.</p>
      </div>
    </section>
  );
}