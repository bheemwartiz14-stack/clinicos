"use client";

import Link from "next/link";
import { ArrowLeft, Building2, Users, Clipboard } from "lucide-react";
import { StatusBadge } from "@/components/enterprise-ui";
import { cn } from "@mediclinic/ui";
import type { DepartmentRecord } from "../types/department.types";

function statusTone(status: string) {
  if (status === "active") return "success";
  return "neutral";
}

export function DepartmentDetail({ department }: { department: DepartmentRecord }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">{department.name}</h1>
          <p className="mt-2 text-sm text-slate-600">Department profile, branch mapping, head assignment and relation counts.</p>
        </div>
        <Link href="/settings/departments" className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden /> Back to departments
        </Link>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-primary">
              <Building2 className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Department Code</p>
              <p className="text-base text-slate-700">{department.code ?? "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge tone={statusTone(department.status)}>{department.status}</StatusBadge>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Branch</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{department.branchName ?? "Unknown branch"}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Department Head</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{department.headName ?? "Unassigned"}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Last updated</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{new Date(department.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3 text-slate-900">
              <Users className="h-4 w-4" aria-hidden />
              <p className="text-sm font-semibold">Department Relations</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Doctors</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{department.relations.doctors}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Staff</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{department.relations.staff}</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3 text-slate-900">
              <Clipboard className="h-4 w-4" aria-hidden />
              <p className="text-sm font-semibold">Description</p>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{department.description || "No description has been provided for this department."}</p>
          </div>
        </div>
      </section>
    </section>
  );
}
