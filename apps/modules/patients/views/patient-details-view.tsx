import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientInfoCard } from "../components/patient-info-card";
import { PatientMedicalInfoCard } from "../components/patient-medical-info-card";
import { PatientStatusBadge } from "../components/patient-status-badge";
import { deletePatientAction, togglePatientStatusAction } from "../actions/patient.actions";
import type { PatientDetails } from "../types/patient.types";

export function PatientDetailsView({ patient, canEdit, canDelete, canManage }: { patient: PatientDetails; canEdit: boolean; canDelete: boolean; canManage: boolean }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{patient.fullName}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{patient.patientCode} · {patient.phone}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link href="/patients">All Patients</Link></Button>
          {canEdit ? <Button asChild><Link href={`/patients/${patient.id}/edit` as any}>Edit</Link></Button> : null}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle>Status</CardTitle></CardHeader><CardContent><PatientStatusBadge isActive={patient.isActive} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Total appointments</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{patient.appointmentCount}</CardContent></Card>
        <Card><CardHeader><CardTitle>Upcoming</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{patient.upcomingAppointmentCount}</CardContent></Card>
        <Card><CardHeader><CardTitle>Last appointment</CardTitle></CardHeader><CardContent>{patient.lastAppointmentAt ? new Date(patient.lastAppointmentAt).toLocaleDateString() : "None"}</CardContent></Card>
      </div>
      <PatientInfoCard patient={patient} />
      <PatientMedicalInfoCard patient={patient} />
      <Card>
        <CardHeader><CardTitle>Emergency Contact</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <p><span className="font-semibold">Name:</span> {patient.emergencyContactName ?? "Not recorded"}</p>
          <p><span className="font-semibold">Phone:</span> {patient.emergencyContactPhone ?? "Not recorded"}</p>
        </CardContent>
      </Card>
      <div className="flex gap-2">
        {canManage ? (
          <form action={togglePatientStatusAction as unknown as (formData: FormData) => void}>
            <input type="hidden" name="id" value={patient.id} />
            <Button type="submit" variant="secondary">{patient.isActive ? "Deactivate" : "Activate"}</Button>
          </form>
        ) : null}
        {canDelete ? (
          <form action={deletePatientAction as unknown as (formData: FormData) => void}>
            <input type="hidden" name="id" value={patient.id} />
            <Button type="submit" variant="destructive">Delete Patient</Button>
          </form>
        ) : null}
      </div>
    </section>
  );
}

export { PatientDetailsView as PatientDetailView };
