import { Building2, CalendarDays, Mail, Phone, Plus, Search, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ActionState, PatientListItem, PatientStats } from "../patients.types";
import { DeletePatientButton, PatientsToast } from "./add-new-patient.view";

type PatientAction = (formData: FormData) => Promise<ActionState>;

type PatientsViewProps = {
  breadcrumb: string[];
  deleteAction: PatientAction;
  description: string;
  patients: PatientListItem[];
  query: string;
  stats: PatientStats;
  title: string;
};

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function PatientsView({
  breadcrumb,
  deleteAction,
  description,
  patients,
  query,
  stats,
  title,
}: PatientsViewProps) {
  const statCards = [
    { icon: Users, label: "Total patients", value: stats.totalPatients },
    { icon: Plus, label: "New this week", value: stats.newThisWeek },
    {
      icon: CalendarDays,
      label: "Updated this week",
      value: stats.recentlyUpdated,
    },
  ];

  return (
    <DashboardShell activeHref="/patients" breadcrumb={breadcrumb} title={title}>
      <PatientsToast />
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/patients/add-patient">
              <Plus className="size-4" />
              Add patient
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {statCards.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-2xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{label}</p>
                <span className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Patient registry</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Recent records sorted by latest activity.
              </p>
            </div>

            <form action="/patients/view" className="flex w-full gap-2 lg:w-80">
              <div className="relative flex-1">
                <Search className="-translate-y-1/2 absolute top-1/2 left-2.5 size-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  defaultValue={query}
                  name="q"
                  placeholder="Search patients"
                  type="search"
                />
              </div>

              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
          </div>

          {patients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Admission</TableHead>
                  <TableHead>Clinical</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <UserRound className="size-4" />
                        </span>

                        <div>
                          <p className="font-medium text-foreground">{patient.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            DOB {formatDate(patient.dateOfBirth)}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="grid gap-1 text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <Phone className="size-3.5" />
                          {patient.phone}
                        </span>

                        {patient.email ? (
                          <span className="inline-flex items-center gap-2">
                            <Mail className="size-3.5" />
                            {patient.email}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="grid gap-1 text-sm">
                        <span className="font-medium capitalize text-foreground">
                          {patient.status}
                        </span>
                        {patient.doctorAssigned ? (
                          <span className="text-muted-foreground">
                            Dr. {patient.doctorAssigned}
                          </span>
                        ) : null}
                        {patient.admissionDate ? (
                          <span className="text-muted-foreground">
                            Admitted {formatDate(patient.admissionDate)}
                          </span>
                        ) : null}
                        {patient.branchName ? (
                          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                            <Building2 className="size-3.5" />
                            {patient.branchName}
                            {patient.branchCode ? ` (${patient.branchCode})` : ""}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="capitalize">
                          {patient.gender}
                        </Badge>

                        {patient.age !== null ? (
                          <Badge variant="outline">{patient.age} yrs</Badge>
                        ) : null}

                        {patient.bloodGroup ? (
                          <Badge variant="secondary">{patient.bloodGroup}</Badge>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {formatDate(patient.updatedAt)}
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <DeletePatientButton action={deleteAction} patient={patient} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid min-h-56 place-items-center p-6 text-center">
              <div>
                <UserRound className="mx-auto size-9 text-muted-foreground" />
                <h3 className="mt-3 font-medium text-foreground">No patients found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a patient or adjust the current search.
                </p>
                <div className="mt-4">
                  <Button asChild className="gap-2">
                    <Link href="/patients/add-patient">
                      <Plus className="size-4" />
                      Add patient
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
