import { DepartmentRecord } from "../types/department.types";
import { StatusBadge } from "@/components/enterprise-ui";
import Link from "next/link";
import { Building2, Users } from "lucide-react";

function statusTone(status: string) {
  if (status === "active") return "success";
  return "neutral";
}

export function serializeDepartment(department: Omit<DepartmentRecord, "updatedAt"> & { updatedAt: Date }): DepartmentRecord {
  return {
    ...department,
    updatedAt: new Date(department.updatedAt).toISOString()
  };
}

export function DepartmentsView({ departments }: { departments: DepartmentRecord[] }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Department Management</h1>
          <p className="mt-2 text-sm text-slate-600">Create and view department assignments, branch mappings, and team relations.</p>
        </div>
        <Link href="/settings/departments/create" className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90">
          Create Department
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {departments.map((department) => (
          <article key={department.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">{department.branchName ?? "Branch"}</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">{department.name}</h2>
                <p className="mt-2 text-sm text-slate-500">{department.code ?? "No code assigned"}</p>
              </div>
              <StatusBadge tone={statusTone(department.status)}>{department.status}</StatusBadge>
            </div>

            <div className="grid gap-3 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" aria-hidden />
                <span>{department.relations.doctors} doctors</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" aria-hidden />
                <span>{department.relations.staff} staff</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <Link href={`/settings/departments/${department.id}`} className="text-sm font-semibold text-primary">
                View department
              </Link>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Updated</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
