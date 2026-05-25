"use client";

import Link from "next/link";
import { Edit, Filter, MoreHorizontal, Plus, Search, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { createSpecialtyAction, updateSpecialtyAction, deleteSpecialtyAction, toggleSpecialtyAction } from "../actions/specialty.actions";
import type { SpecialtyRecord } from "../services/specialty.service";
import { FormField, SelectField, TextareaField } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Department = { id: string; name: string; code: string | null };
const SPECIALTY_ROUTE = "/doctors/specialty";

export function SpecialtiesListView({
  specialties,
  departments,
  total,
  page,
  perPage,
  totalPages,
  search,
  departmentId,
  status,
}: {
  specialties: SpecialtyRecord[];
  departments: Department[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  search: string;
  departmentId: string;
  status: string;
}) {
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  const activeOnPage = specialties.filter((specialty) => specialty.isActive).length;
  const assignedDoctorsOnPage = specialties.reduce((sum, specialty) => sum + specialty.doctorCount, 0);
  const selectedDepartment = departments.find((department) => department.id === departmentId);

  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-lg border border-border bg-background p-4 text-foreground shadow-sm sm:p-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">Specializations List</h1>
          <p className="mt-1 text-sm text-muted-foreground">View and manage all medical specializations.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              {total} total
            </span>
            <span className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              {activeOnPage} active shown
            </span>
            <span className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              {assignedDoctorsOnPage} doctors shown
            </span>
            {selectedDepartment ? (
              <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                {selectedDepartment.name}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 xl:w-auto">
          <Button asChild className="h-10 shrink-0 self-start bg-primary px-4 text-primary-foreground hover:bg-primary/90 xl:self-end">
            <Link href={`${SPECIALTY_ROUTE}/create`}>
              <Plus className="h-4 w-4" aria-hidden />
              Add Specialization
            </Link>
          </Button>
          <form action={SPECIALTY_ROUTE} className="grid w-full gap-3 rounded-lg border border-border bg-muted/40 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1fr)_12rem_9rem_auto_auto] xl:w-[760px]">
            <div className="relative min-w-0 lg:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                name="search"
                defaultValue={search}
                placeholder="Search specializations..."
                className="h-10 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring"
              />
            </div>
            <select
              name="departmentId"
              defaultValue={departmentId}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring"
            >
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={status}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring"
            >
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <Button type="submit" variant="outline" className="h-10 border-border bg-background text-foreground hover:bg-muted hover:text-foreground">
              <Filter className="h-4 w-4" aria-hidden />
              Filter
            </Button>
            {(search || departmentId || status) ? (
              <Button asChild variant="ghost" className="h-10 text-muted-foreground hover:bg-muted hover:text-foreground">
                <Link href={SPECIALTY_ROUTE}>
                  <X className="h-4 w-4" aria-hidden />
                  Clear
                </Link>
              </Button>
            ) : null}
          </form>
        </div>
      </div>

      <div className="mt-7 overflow-hidden rounded-lg border border-border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-border bg-card text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="w-[18%] px-4 py-4 font-semibold sm:px-5">Name</th>
                <th className="w-[36%] px-4 py-4 font-semibold sm:px-5">Description</th>
                <th className="w-[10%] px-4 py-4 font-semibold sm:px-5">Doctors</th>
                <th className="w-[18%] px-4 py-4 font-semibold sm:px-5">Department</th>
                <th className="w-[10%] px-4 py-4 font-semibold sm:px-5">Status</th>
                <th className="w-[8%] px-4 py-4 text-right font-semibold sm:px-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {specialties.map((specialty) => (
                <tr key={specialty.id} className="transition hover:bg-muted/50">
                  <td className="px-4 py-5 align-middle sm:px-5">
                    <div className="font-semibold text-foreground">{specialty.name}</div>
                    {specialty.code ? (
                      <div className="mt-1 inline-flex rounded border border-border px-1.5 py-0.5 text-[11px] uppercase text-muted-foreground">{specialty.code}</div>
                    ) : null}
                  </td>
                  <td className="max-w-md px-4 py-5 align-middle text-foreground sm:px-5">
                    <span className="line-clamp-2 leading-6">{specialty.description || "No description added"}</span>
                  </td>
                  <td className="px-4 py-5 align-middle sm:px-5">
                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-border bg-card px-2 font-semibold text-foreground">
                      {specialty.doctorCount}
                    </span>
                  </td>
                  <td className="px-4 py-5 align-middle text-foreground sm:px-5">{specialty.departmentName ?? "Unassigned"}</td>
                  <td className="px-4 py-5 align-middle sm:px-5">
                    <Badge className={specialty.isActive ? "h-6 rounded-full border-emerald-500/20 bg-emerald-500 px-3 text-xs font-bold text-emerald-950 hover:bg-emerald-500" : "h-6 rounded-full border-border bg-muted px-3 text-xs font-bold text-muted-foreground hover:bg-muted"}>
                      {specialty.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-5 align-middle sm:px-5">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Actions for ${specialty.name}`}>
                            <MoreHorizontal className="h-4 w-4" aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 border-border bg-card text-foreground">
                          <DropdownMenuItem asChild className="cursor-pointer focus:bg-muted focus:text-foreground">
                            <Link href={`${SPECIALTY_ROUTE}/${specialty.id}/edit`}>
                              <Edit className="h-4 w-4" aria-hidden />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem asChild className="cursor-pointer focus:bg-muted focus:text-foreground">
                            <form action={toggleSpecialtyAction}>
                              <input type="hidden" name="id" value={specialty.id} />
                              <button type="submit" className="flex w-full items-center gap-2">
                                {specialty.isActive ? <ToggleRight className="h-4 w-4" aria-hidden /> : <ToggleLeft className="h-4 w-4" aria-hidden />}
                                {specialty.isActive ? "Deactivate" : "Activate"}
                              </button>
                            </form>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild variant="destructive" className="cursor-pointer focus:bg-destructive/10">
                            <form action={deleteSpecialtyAction}>
                              <input type="hidden" name="id" value={specialty.id} />
                              <button type="submit" className="flex w-full items-center gap-2">
                                <Trash2 className="h-4 w-4" aria-hidden />
                                Delete
                              </button>
                            </form>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {specialties.length === 0 ? (
            <div className="grid min-h-64 place-items-center px-4 py-12 text-center">
              <div>
                <p className="text-sm font-medium text-foreground">No specializations found</p>
                <p className="mt-1 text-sm text-muted-foreground">Adjust filters or create your first specialization.</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">Showing <span className="font-medium text-foreground">{start}-{end}</span> of <span className="font-medium text-foreground">{total}</span> specializations</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" className="border-border bg-background text-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50">
            <Link aria-disabled={page <= 1} className={page <= 1 ? "pointer-events-none opacity-50" : undefined} href={buildSpecialtyUrl({ search, departmentId, status, page: Math.max(page - 1, 1) })}>Previous</Link>
          </Button>
          <div className="hidden items-center gap-1 sm:flex">
            {buildPageNumbers(page, totalPages).map((pageNumber) => (
              <Button
                key={pageNumber}
                asChild
                variant={pageNumber === page ? "default" : "ghost"}
                size="sm"
                className={pageNumber === page ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground hover:bg-muted hover:text-foreground"}
              >
                <Link href={buildSpecialtyUrl({ search, departmentId, status, page: pageNumber })}>{pageNumber}</Link>
              </Button>
            ))}
          </div>
          <span className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground sm:hidden">
            Page {page} of {totalPages}
          </span>
          <Button asChild variant="outline" size="sm" className="border-border bg-background text-foreground hover:bg-muted hover:text-foreground">
            <Link aria-disabled={page >= totalPages} className={page >= totalPages ? "pointer-events-none opacity-50" : undefined} href={buildSpecialtyUrl({ search, departmentId, status, page: Math.min(page + 1, totalPages) })}>Next</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SpecialtyForm({
  specialty,
  departments,
}: {
  specialty?: SpecialtyRecord | null;
  departments: Department[];
}) {
  const action = specialty ? updateSpecialtyAction.bind(null, specialty.id) : createSpecialtyAction;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">
          {specialty ? "Edit Specialty" : "Add Specialty"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {specialty ? "Update specialty details and department association." : "Create a new doctor specialty under a department."}
        </p>
      </div>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Specialty Details</CardTitle>
          <CardDescription>Specialties define the area of expertise for doctors.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="grid gap-4 md:grid-cols-2">
            <FormField label="Specialty name" name="name" defaultValue={specialty?.name ?? ""} required className="md:col-span-2" />
            <FormField label="Code" name="code" defaultValue={specialty?.code ?? ""} hint="Optional short code (e.g., CARDIO)" />
            <SelectField
              label="Department"
              name="departmentId"
              defaultValue={specialty?.departmentId ?? ""}
              required
              options={[
                { value: "", label: "Select department" },
                ...departments.map((dept) => ({ value: dept.id, label: dept.name })),
              ]}
            />
            <div className="flex items-end">
              <label className="flex items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={specialty?.isActive ?? true}
                  className="h-4 w-4 rounded border-border text-primary accent-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="font-medium text-foreground">Active</span>
              </label>
            </div>
            <TextareaField
              label="Description"
              name="description"
              defaultValue={specialty?.description ?? ""}
              className="md:col-span-2"
              rows={3}
            />
            <div className="flex items-end gap-2">
              <Button type="submit">{specialty ? "Save Changes" : "Create Specialty"}</Button>
              <Button asChild variant="outline">
                <Link href={SPECIALTY_ROUTE}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function buildSpecialtyUrl(params: { search: string; departmentId: string; status: string; page: number }) {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.departmentId) searchParams.set("departmentId", params.departmentId);
  if (params.status) searchParams.set("status", params.status);
  if (params.page > 1) searchParams.set("page", String(params.page));
  const query = searchParams.toString();
  return `${SPECIALTY_ROUTE}${query ? `?${query}` : ""}`;
}

function buildPageNumbers(currentPage: number, totalPages: number) {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
