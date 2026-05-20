"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { PatientRecord } from "@modules/patients/types/patient.types";

interface PatientsTableClientProps {
  patients: PatientRecord[];
}

export function PatientsTableClient({ patients }: PatientsTableClientProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    if (!needle) return patients;
    return patients.filter(
      (p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(needle) ||
        p.mrn.toLowerCase().includes(needle) ||
        p.phone.includes(needle) ||
        (p.email?.toLowerCase().includes(needle) ?? false) ||
        (p.insurance?.payer?.toLowerCase().includes(needle) ?? false)
    );
  }, [patients, query]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, MRN, phone, email, or insurance..."
            className="h-10 w-full rounded-lg border bg-white pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <span className="flex items-center text-sm text-muted-foreground">
          {filtered.length} of {patients.length} patients
        </span>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">MRN</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">DOB</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Sex</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Phone</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Insurance</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient) => (
                <tr key={patient.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{patient.mrn}</td>
                  <td className="px-4 py-3">{patient.firstName} {patient.lastName}</td>
                  <td className="px-4 py-3">{patient.dateOfBirth}</td>
                  <td className="px-4 py-3 capitalize">{patient.sex}</td>
                  <td className="px-4 py-3">{patient.phone}</td>
                  <td className="px-4 py-3">{patient.insurance?.payer ?? "Self pay"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/patients/${patient.id}`} className="text-primary hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No patients found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between">
        <Link href="/patients" className="text-sm text-primary hover:underline">
          ← Back to patient management
        </Link>
        <Link href="/patients/create" className="text-sm text-primary hover:underline">
          Create new patient →
        </Link>
      </div>
    </div>
  );
}