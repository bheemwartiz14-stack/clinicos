"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Tag } from "lucide-react";
import { cn } from "@mediclinic/ui";
import { Select2Field } from "@/components/form-controls";
import { createDepartmentAction, type DepartmentActionState } from "../actions/department.actions";
import { departmentUpsertSchema, departmentStatuses, type DepartmentStatus } from "../validations/department.validation";
import type { DepartmentHeadOption, DepartmentRecord } from "../types/department.types";

function fieldError(result: DepartmentActionState | null, field: string) {
  return result?.fieldErrors?.[field]?.[0];
}

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function TextField({
  label,
  name,
  defaultValue,
  error,
  required = false
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-slate-900">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      <input
        name={name}
        type="text"
        required={required}
        defaultValue={defaultValue ?? ""}
        className={cn(
          "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
          error && "border-red-300"
        )}
      />
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
  error
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  error?: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-slate-900">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={5}
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
          error && "border-red-300"
        )}
      />
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  children,
  error
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  children: React.ReactNode;
  error?: string;
}) {
  return <Select2Field label={label} name={name} defaultValue={defaultValue ?? ""} error={error}>{children}</Select2Field>;
}

export function DepartmentForm({
  branches,
  heads,
  department
}: {
  branches: Array<{ id: string; name: string }>;
  heads: DepartmentHeadOption[];
  department?: DepartmentRecord;
}) {
  const router = useRouter();
  const [result, setResult] = useState<DepartmentActionState | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    const payload = {
      branchId: formValue(formData, "branchId"),
      name: formValue(formData, "name"),
      code: formValue(formData, "code") || null,
      description: formValue(formData, "description"),
      status: formValue(formData, "status") as DepartmentStatus,
      headId: formValue(formData, "headId") || null
    };

    const parsed = departmentUpsertSchema.safeParse(payload);
    if (!parsed.success) {
      setResult({ ok: false, message: "Please fix the highlighted department details.", fieldErrors: parsed.error.flatten().fieldErrors });
      return;
    }

    const action = async () => {
      const form = new FormData();
      if (department) form.set("id", department.id);
      form.set("branchId", payload.branchId);
      form.set("name", payload.name);
      form.set("code", payload.code ?? "");
      form.set("description", payload.description);
      form.set("status", payload.status);
      form.set("headId", payload.headId ?? "");

      return await createDepartmentAction(form);
    };

    startTransition(() => {
      void action().then((nextResult) => {
        setResult(nextResult);
        if (nextResult.ok) router.push("/settings/departments" as any);
      });
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/settings/departments" className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300">
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </Link>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">{department ? "Edit Department" : "Create Department"}</h1>
              <p className="mt-2 text-sm text-slate-600">Configure the department profile, branch mapping, head assignment, and status.</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
            <Building2 className="h-4 w-4" aria-hidden />
            Department Setup
          </div>
        </div>

        {result ? (
          <div className={cn("mb-6 rounded-2xl border px-4 py-3 text-sm font-medium", result.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700")}>{result.message}</div>
        ) : null}

        <form action={submit} className="grid gap-6">
          {department ? <input type="hidden" name="id" value={department.id} /> : null}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                <Tag className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Department Details</h2>
                <p className="text-sm text-slate-600">Name, code, branch mapping, and department head.</p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <SelectField label="Branch" name="branchId" defaultValue={department?.branchId} error={fieldError(result, "branchId")}>
                <option value="">Select a branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </SelectField>
              <TextField label="Department Name" name="name" required defaultValue={department?.name} error={fieldError(result, "name")} />
            </div>

            <div className="grid gap-5 md:grid-cols-2 mt-5">
              <TextField label="Department Code" name="code" defaultValue={department?.code} error={fieldError(result, "code")} />
              <SelectField label="Status" name="status" defaultValue={department?.status ?? "active"} error={fieldError(result, "status")}>
                {departmentStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </SelectField>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <SelectField label="Department Head" name="headId" defaultValue={department?.headId ?? ""} error={fieldError(result, "headId")}>
                <option value="">No head assigned</option>
                {heads.map((head) => (
                  <option key={head.id} value={head.id}>
                    {head.name} {head.branchName ? `· ${head.branchName}` : ""}
                  </option>
                ))}
              </SelectField>
              <div className="grid gap-2 text-sm">
                <span className="font-medium text-slate-900">Department Summary</span>
                <p className="text-sm text-slate-600">Use this area to describe the department’s responsibilities and team composition.</p>
              </div>
            </div>

            <div className="mt-5">
              <TextAreaField label="Description" name="description" defaultValue={department?.description} error={fieldError(result, "description")} />
            </div>
          </section>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="grid gap-1 text-sm text-slate-600">
              <span className="font-medium text-slate-900">Ready to publish</span>
              <p>Save the department and assign it to branch workflows.</p>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Save Department
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
