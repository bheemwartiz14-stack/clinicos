import { Building2, CheckCircle2, Search, XCircle } from "lucide-react";
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
import type { ActionState, DepartmentsPageModel } from "../departments.types";
import {
  DeleteDepartmentButton,
  DepartmentForm,
  DepartmentsToast,
  EditDepartmentButton,
} from "./departments.form";

type DepartmentAction = (formData: FormData) => Promise<ActionState>;

type DepartmentsViewProps = DepartmentsPageModel & {
  createAction: DepartmentAction;
  updateAction: DepartmentAction;
  deleteAction: DepartmentAction;
};

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function DepartmentsView({
  breadcrumb,
  createAction,
  deleteAction,
  departments,
  description,
  query,
  stats,
  title,
  updateAction,
}: DepartmentsViewProps) {
  const statCards = [
    { icon: Building2, label: "Total departments", value: stats.totalDepartments },
    { icon: CheckCircle2, label: "Active", value: stats.activeDepartments },
    { icon: XCircle, label: "Inactive", value: stats.inactiveDepartments },
  ];

  return (
    <DashboardShell activeHref="/doctors/department" breadcrumb={breadcrumb} title={title}>
      <DepartmentsToast />
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          <DepartmentForm action={createAction} />
        </div>

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
              <h2 className="font-semibold text-foreground">Department list</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Departments sorted by latest activity.
              </p>
            </div>

            <form action="/doctors/department" className="flex w-full gap-2 lg:w-80">
              <div className="relative flex-1">
                <Search className="-translate-y-1/2 absolute top-1/2 left-2.5 size-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  defaultValue={query}
                  name="q"
                  placeholder="Search departments"
                  type="search"
                />
              </div>
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
          </div>

          {departments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Department Head</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{department.name}</p>
                        {department.description ? (
                          <p className="text-muted-foreground text-xs">{department.description}</p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {department.code ?? "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {department.departmentHeadName ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={department.isActive ? "secondary" : "outline"}>
                        {department.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(department.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <EditDepartmentButton action={updateAction} department={department} />
                        <DeleteDepartmentButton action={deleteAction} department={department} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid min-h-56 place-items-center p-6 text-center">
              <div>
                <Building2 className="mx-auto size-9 text-muted-foreground" />
                <h3 className="mt-3 font-medium text-foreground">No departments found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a department or adjust the current search.
                </p>
                <div className="mt-4">
                  <DepartmentForm action={createAction} />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
