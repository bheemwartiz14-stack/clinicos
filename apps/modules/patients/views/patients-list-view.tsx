import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateAge } from "../helpers/age-calculator.helper";
import type { PatientRecord } from "../types/patient.types";
import { PatientEmptyState } from "../components/patient-empty-state";
import { PatientFilters } from "../components/patient-filters";
import { PatientStatusBadge } from "../components/patient-status-badge";
import { togglePatientStatusAction } from "../actions/patient.actions";

export function PatientsListView({
  patients,
  search,
  canCreate,
  canEdit,
  canManage
}: {
  patients: PatientRecord[];
  search: string;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManage: boolean;
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Patients</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage patient demographics, contact details, medical notes, and appointment activity.</p>
        </div>
        {canCreate ? <Button asChild><Link href={"/patients/add" as any}>Add Patient</Link></Button> : null}
      </div>
      <PatientFilters search={search} />
      {patients.length === 0 ? (
        <PatientEmptyState canCreate={canCreate} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Code</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-mono text-xs">{patient.patientCode}</TableCell>
                    <TableCell className="font-semibold">{patient.fullName}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.email ?? "Not recorded"}</TableCell>
                    <TableCell>{calculateAge(patient.dateOfBirth)}</TableCell>
                    <TableCell>{patient.bloodGroup}</TableCell>
                    <TableCell><PatientStatusBadge isActive={patient.isActive} /></TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline"><Link href={`/patients/${patient.id}` as any}>View</Link></Button>
                        {canEdit ? <Button asChild size="sm" variant="outline"><Link href={`/patients/${patient.id}/edit` as any}>Edit</Link></Button> : null}
                        {canManage ? (
                          <form action={togglePatientStatusAction as unknown as (formData: FormData) => void}>
                            <input type="hidden" name="id" value={patient.id} />
                            <Button type="submit" size="sm" variant="secondary">{patient.isActive ? "Deactivate" : "Activate"}</Button>
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
      )}
    </section>
  );
}

export { PatientsListView as PatientsView };
