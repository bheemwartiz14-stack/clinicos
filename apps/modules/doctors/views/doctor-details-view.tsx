import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteDoctorAction, toggleDoctorStatusAction } from "../actions/doctor.actions";
import type { DoctorDetails } from "../types/doctor.types";

function money(value: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

export function DoctorDetailsView({ doctor, canEdit, canDelete, canManage }: { doctor: DoctorDetails; canEdit: boolean; canDelete: boolean; canManage: boolean }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{doctor.displayName}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{doctor.email} · {doctor.phone ?? "No phone"}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link href="/doctors">All Doctors</Link></Button>
          {canEdit ? <Button asChild><Link href={`/doctors/${doctor.id}/edit` as any}>Edit</Link></Button> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle>Status</CardTitle></CardHeader><CardContent className="flex gap-2"><Badge>{doctor.isActive ? "Active" : "Inactive"}</Badge><Badge variant="outline">{doctor.isAvailable ? "Available" : "Unavailable"}</Badge></CardContent></Card>
        <Card><CardHeader><CardTitle>Department</CardTitle></CardHeader><CardContent>{doctor.departmentName ?? "Unassigned"}</CardContent></Card>
        <Card><CardHeader><CardTitle>Specialty</CardTitle></CardHeader><CardContent>{doctor.specialtyName ?? "General Medicine"}</CardContent></Card>
        <Card><CardHeader><CardTitle>Consultation Fee</CardTitle></CardHeader><CardContent>{money(doctor.consultationFee)}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <p><span className="font-semibold">Qualification:</span> {doctor.qualification ?? "Not recorded"}</p>
          <p><span className="font-semibold">Experience:</span> {doctor.experienceYears} years</p>
          <p><span className="font-semibold">License:</span> {doctor.licenseNumber}</p>
          <p><span className="font-semibold">Branch:</span> {doctor.branchName ?? "Clinic"}</p>
          <p className="md:col-span-2"><span className="font-semibold">Bio:</span> {doctor.bio ?? "No bio recorded."}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Weekly Schedule</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Day</TableHead><TableHead>Time</TableHead><TableHead>Slot Duration</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {doctor.schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="capitalize">{schedule.dayOfWeek}</TableCell>
                  <TableCell>{schedule.startTime} - {schedule.endTime}</TableCell>
                  <TableCell>{schedule.slotDuration} min</TableCell>
                  <TableCell><Badge variant={schedule.isActive ? "default" : "secondary"}>{schedule.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Generated Upcoming Slots</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {doctor.slots.slice(0, 25).map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell>{slot.slotDate}</TableCell>
                  <TableCell>{slot.startTime} - {slot.endTime}</TableCell>
                  <TableCell><Badge variant={slot.status === "booked" ? "default" : "outline"}>{slot.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {canManage ? <form action={toggleDoctorStatusAction as unknown as (formData: FormData) => void}><input type="hidden" name="id" value={doctor.id} /><Button type="submit" variant="secondary">{doctor.isActive ? "Deactivate Doctor" : "Activate Doctor"}</Button></form> : null}
        {canDelete ? <form action={deleteDoctorAction as unknown as (formData: FormData) => void}><input type="hidden" name="id" value={doctor.id} /><Button type="submit" variant="destructive">Delete Doctor</Button></form> : null}
      </div>
    </section>
  );
}
