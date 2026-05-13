import {
  BadgeIndianRupee,
  BriefcaseMedical,
  CheckCircle2,
  Mail,
  Search,
  Stethoscope,
  UserRound,
} from "lucide-react";
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
import type { DoctorsPageModel } from "../doctors.types";

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatFee(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(Number(value));
}

export function DoctorsView({
  breadcrumb,
  description,
  doctors,
  query,
  stats,
  title,
}: DoctorsPageModel) {
  const statCards = [
    { icon: Stethoscope, label: "Total doctors", value: stats.totalDoctors },
    { icon: CheckCircle2, label: "Available", value: stats.availableDoctors },
    { icon: BriefcaseMedical, label: "Departments", value: stats.departments },
  ];

  return (
    <DashboardShell activeHref="/doctors/view" breadcrumb={breadcrumb} title={title}>
      <div className="space-y-5">
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>

        <div className="grid gap-4 sm:grid-cols-3">
          {statCards.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border bg-card p-4 shadow-sm">
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
              <h2 className="font-semibold text-foreground">Doctor registry</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Doctors sorted by latest profile activity.
              </p>
            </div>

            <form action="/doctors/view" className="flex w-full gap-2 lg:w-96">
              <div className="relative flex-1">
                <Search className="-translate-y-1/2 absolute top-1/2 left-2.5 size-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  defaultValue={query}
                  name="q"
                  placeholder="Search doctors"
                  type="search"
                />
              </div>

              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
          </div>

          {doctors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {doctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <UserRound className="size-4" />
                        </span>

                        <div>
                          <p className="font-medium text-foreground">{doctor.name}</p>
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="size-3.5" />
                            {doctor.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="grid gap-1 text-sm">
                        <span className="font-medium text-foreground">
                          {doctor.specialization ?? "-"}
                        </span>
                        <span className="text-muted-foreground">{doctor.qualification ?? "-"}</span>
                        {doctor.experienceYears !== null ? (
                          <span className="text-muted-foreground">
                            {doctor.experienceYears} years experience
                          </span>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {doctor.department ?? "-"}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {doctor.branchName ? (
                        <span>
                          {doctor.branchName}
                          {doctor.branchCode ? ` (${doctor.branchCode})` : ""}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <BadgeIndianRupee className="size-3.5" />
                        {formatFee(doctor.consultationFee)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge variant={doctor.isAvailable ? "secondary" : "outline"}>
                        {doctor.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {formatDate(doctor.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid min-h-56 place-items-center p-6 text-center">
              <div>
                <Stethoscope className="mx-auto size-9 text-muted-foreground" />
                <h3 className="mt-3 font-medium text-foreground">No doctors found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add doctors from user management or adjust the current search.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
