"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AppointmentDoctorOption } from "../types/appointment.types";

export function DoctorSearchSelect({ doctors, value, onChange }: { doctors: AppointmentDoctorOption[]; value: string; onChange: (doctorId: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => doctors.filter((doctor) => `${doctor.displayName} ${doctor.specialty}`.toLowerCase().includes(search.toLowerCase())), [doctors, search]);
  return (
    <div className="grid gap-2">
      <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search doctors..." />
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
        <SelectContent>
          {filtered.map((doctor) => <SelectItem key={doctor.id} value={doctor.id}>Dr. {doctor.displayName.replace(/^Dr\.\s*/i, "")} ({doctor.specialty})</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
