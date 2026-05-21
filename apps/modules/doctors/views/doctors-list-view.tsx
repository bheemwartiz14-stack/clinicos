import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toggleDoctorStatusAction } from "../actions/doctor.actions";
import type { DoctorRecord } from "../types/doctor.types";

function money(value: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

export function DoctorsListView({ doctors, canCreate, canEdit, canManage }: { doctors: DoctorRecord[]; canCreate: boolean; canEdit: boolean; canManage: boolean }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Doctors</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage doctor accounts, departments, specialties, fees, availability, and generated appointment slots.</p>
        </div>
        {canCreate ? <Button asChild><Link href={"/doctors/add" as any}>Add Doctor</Link></Button> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Total doctors</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{doctors.length}</CardContent></Card>
        <Card><CardHeader><CardTitle>Available</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{doctors.filter((doctor) => doctor.isAvailable && doctor.isActive).length}</CardContent></Card>
        <Card><CardHeader><CardTitle>Future slots</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{doctors.reduce((total, doctor) => total + doctor.slotCount, 0)}</CardContent></Card>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Slots</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>
                    <div className="font-semibold">{doctor.displayName}</div>
                    <div className="text-xs text-muted-foreground">{doctor.email}</div>
                  </TableCell>
                  <TableCell>{doctor.departmentName ?? "Unassigned"}</TableCell>
                  <TableCell>{doctor.specialtyName ?? "General Medicine"}</TableCell>
                  <TableCell>{money(doctor.consultationFee)}</TableCell>
                  <TableCell>{doctor.slotCount} total, {doctor.bookedSlotCount} booked</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={doctor.isActive ? "default" : "secondary"}>{doctor.isActive ? "Active" : "Inactive"}</Badge>
                      <Badge variant={doctor.isAvailable ? "outline" : "destructive"}>{doctor.isAvailable ? "Available" : "Unavailable"}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm"><Link href={`/doctors/${doctor.id}` as any}>View</Link></Button>
                      {canEdit ? <Button asChild variant="outline" size="sm"><Link href={`/doctors/${doctor.id}/edit` as any}>Edit</Link></Button> : null}
                      {canManage ? (
                        <form action={toggleDoctorStatusAction as unknown as (formData: FormData) => void}>
                          <input type="hidden" name="id" value={doctor.id} />
                          <Button type="submit" variant="secondary" size="sm">{doctor.isActive ? "Deactivate" : "Activate"}</Button>
                        </form>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

export { DoctorsListView as DoctorsView };
