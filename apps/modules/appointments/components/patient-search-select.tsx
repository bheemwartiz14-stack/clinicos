"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AppointmentPatientOption } from "../types/appointment.types";

export function PatientSearchSelect({
  patients,
  value,
  onChange,
  onAddPatient
}: {
  patients: AppointmentPatientOption[];
  value: string;
  onChange: (patientId: string) => void;
  onAddPatient: () => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => patients.filter((patient) => patient.label.toLowerCase().includes(search.toLowerCase())), [patients, search]);
  return (
    <div className="grid gap-2">
      <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patients..." />
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
        <SelectContent>
          {filtered.map((patient) => <SelectItem key={patient.id} value={patient.id}>{patient.label}</SelectItem>)}
        </SelectContent>
      </Select>
      {filtered.length === 0 ? <Button type="button" variant="outline" onClick={onAddPatient}>Add New Patient</Button> : null}
    </div>
  );
}
