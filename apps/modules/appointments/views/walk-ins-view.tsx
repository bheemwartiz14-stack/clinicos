"use client";

import { useState } from "react";
import { walkInAppointmentAction } from "../actions/appointment.actions";
import type { DoctorOption } from "../services/appointment.service";
import { FormField, SelectField, TextareaField } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function WalkInsView({
  doctors,
  currentDate,
}: {
  doctors: DoctorOption[];
  currentDate: string;
}) {
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [patients, setPatients] = useState<Array<{ id: string; fullName: string; phone: string }>>([]);
  const [searching, setSearching] = useState(false);
  const [newPatient, setNewPatient] = useState({
    fullName: "", phone: "", email: "", dateOfBirth: "",
    gender: "", bloodGroup: "", address: "",
    emergencyContactName: "", emergencyContactPhone: "",
  });

  const searchPatients = async (q: string) => {
    if (!q.trim()) { setPatients([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/patients/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setPatients(data);
    } catch { /* ignore */ }
    finally { setSearching(false); }
  };

  const createPatient = async () => {
    if (!newPatient.fullName.trim() || !newPatient.phone.trim()) return;
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatient),
      });
      const created = await res.json();
      setSelectedPatientId(created.id);
      setPatientSearch(created.fullName);
      setShowNewPatient(false);
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">Walk-in</Badge>
        <h1 className="text-2xl font-semibold tracking-tight">Walk-in Patient</h1>
        <p className="text-sm text-muted-foreground">Register and book a walk-in patient quickly.</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle>Walk-in Registration</CardTitle>
          <CardDescription>Select existing patient or register a new one.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {showNewPatient ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Full name" required value={newPatient.fullName}
                  onChange={(e) => setNewPatient((p) => ({ ...p, fullName: e.target.value }))} />
                <FormField label="Phone" required value={newPatient.phone}
                  onChange={(e) => setNewPatient((p) => ({ ...p, phone: e.target.value }))} />
                <FormField label="Email" type="email" value={newPatient.email}
                  onChange={(e) => setNewPatient((p) => ({ ...p, email: e.target.value }))} />
                <FormField label="Date of birth" type="date" value={newPatient.dateOfBirth}
                  onChange={(e) => setNewPatient((p) => ({ ...p, dateOfBirth: e.target.value }))} />
                <SelectField label="Gender" value={newPatient.gender}
                  onChange={(e) => setNewPatient((p) => ({ ...p, gender: e.target.value }))}
                  options={[{ value: "", label: "Select" }, { value: "Male", label: "Male" }, { value: "Female", label: "Female" }, { value: "Other", label: "Other" }]} />
                <SelectField label="Blood group" value={newPatient.bloodGroup}
                  onChange={(e) => setNewPatient((p) => ({ ...p, bloodGroup: e.target.value }))}
                  options={[{ value: "", label: "Select" }, ...BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }))]} />
              </div>
              <div className="flex gap-2">
                <Button onClick={createPatient} disabled={!newPatient.fullName.trim() || !newPatient.phone.trim()}>Save & Continue</Button>
                <Button variant="outline" onClick={() => setShowNewPatient(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <form action={walkInAppointmentAction} className="space-y-5">
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">Patient</Label>
                {selectedPatientId ? (
                  <div className="flex items-center gap-3 rounded-md border bg-muted/20 px-4 py-3">
                    <span className="font-medium">{patientSearch}</span>
                    <button type="button" onClick={() => { setSelectedPatientId(""); setPatientSearch(""); }}
                      className="ml-auto text-xs text-muted-foreground underline">Change</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input placeholder="Search patient by name or phone..."
                      value={patientSearch}
                      onChange={(e) => { setPatientSearch(e.target.value); if (e.target.value.length >= 2) searchPatients(e.target.value); }} />
                    {patients.length > 0 && (
                      <div className="max-h-36 overflow-y-auto rounded-md border p-1.5">
                        {patients.map((p) => (
                          <button key={p.id} type="button"
                            onClick={() => { setSelectedPatientId(p.id); setPatientSearch(p.fullName); setPatients([]); }}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted">
                            <span className="font-medium">{p.fullName}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{p.phone}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {patientSearch.length >= 2 && patients.length === 0 && !searching && (
                      <div className="rounded-md border p-3 text-center text-sm">
                        <p className="text-muted-foreground mb-2">No patients found.</p>
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowNewPatient(true)}>Register New Patient</Button>
                      </div>
                    )}
                  </div>
                )}
                <input type="hidden" name="patientId" value={selectedPatientId} />
              </div>

              <SelectField label="Doctor" name="doctorId" required
                options={[{ value: "", label: "Select doctor" }, ...doctors.map((d) => ({ value: d.id, label: `${d.name} (${d.specialty ?? "General"})` }))]} />

              <input type="hidden" name="appointmentDate" value={currentDate} />
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Time" name="startTime" type="time" required />
                <SelectField label="Type" name="type" defaultValue="walk_in"
                  options={[{ value: "walk_in", label: "Walk-in" }, { value: "in_clinic", label: "In-Clinic" }]} />
              </div>

              <TextareaField label="Reason" name="reason" rows={2} />

              <Button type="submit" disabled={!selectedPatientId} size="lg">Register Walk-in</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
