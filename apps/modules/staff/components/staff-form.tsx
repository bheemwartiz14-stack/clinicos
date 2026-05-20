"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, User } from "lucide-react";

import { cn } from "@mediclinic/ui";
import { rolePermissions } from "@mediclinic/rbac";

import { DatePickerField, Select2Field } from "@/components/form-controls";

import {
  createStaffAction,
  updateStaffAction,
  type StaffActionState,
} from "../actions/staff.actions";

import {
  staffRoles,
  type StaffRole,
} from "../validations/staff.validation";

import type { StaffRecord } from "../types/staff.types";


function fieldError(result: StaffActionState | null, field: string) {
  return result?.fieldErrors?.[field]?.[0];
}

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function permissionLabel(permission: string) {
  return permission.replace(/\./g, " ");
}

function generateUsername(fullName: string) {
  return fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, ".");
}

type TextFieldProps = {
  label: string;
  name: string;
  type?: string;
  value?: string;
  defaultValue?: string | null;
  error?: string;
  required?: boolean;
  hint?: string;
  readOnly?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

function TextField({
  label,
  name,
  type = "text",
  value,
  defaultValue,
  error,
  required = false,
  hint,
  readOnly = false,
  onChange,
}: TextFieldProps) {
  if (type === "date" || type === "time") {
    return (
      <DatePickerField
        label={label}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        error={error}
        hint={hint}
        required={required}
      />
    );
  }

  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-slate-900">
        {label}
        {required ? (
          <span className="ml-1 text-red-500">*</span>
        ) : null}
      </span>

      <input
        name={name}
        type={type}
        value={value}
        defaultValue={defaultValue ?? ""}
        readOnly={readOnly}
        onChange={onChange}
        className={cn(
          "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition",
          "focus:border-primary focus:ring-2 focus:ring-primary/20",
          readOnly && "bg-slate-50",
          error && "border-red-300"
        )}
      />

      {hint ? (
        <span className="text-xs text-slate-500">{hint}</span>
      ) : null}

      {error ? (
        <span className="text-xs font-medium text-red-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  children,
  error,
  required = false,
  hint,
  onChange,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  hint?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <Select2Field
      label={label}
      name={name}
      defaultValue={defaultValue ?? ""}
      onChange={(event) => onChange?.(event.target.value)}
      error={error}
      hint={hint}
      required={required}
    >
      {children}
    </Select2Field>
  );
}

export function StaffForm({
  branches,
  departments,
  staff,
}: {
  branches: Array<{ id: string; name: string }>;
  departments: Array<{ id: string; name: string }>;
  staff?: StaffRecord;
}) {
  const router = useRouter();

  const [result, setResult] =
    useState<StaffActionState | null>(null);

  const [selectedRole, setSelectedRole] =
    useState<StaffRole>(staff?.role ?? "doctor");

  const [isPending, startTransition] = useTransition();

  const [fullName, setFullName] = useState(
    staff?.name ?? ""
  );

  const [username, setUsername] = useState(
    staff?.username ??
      generateUsername(staff?.name ?? "")
  );

  const generatedUsername = useMemo(() => {
    return generateUsername(fullName);
  }, [fullName]);

  function handleNameChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;

    setFullName(value);

    if (!staff?.username) {
      setUsername(generateUsername(value));
    }
  }

  function submit(formData: FormData) {
    const payload = {
      branchId: formValue(formData, "branchId"),
      departmentId:
        formValue(formData, "departmentId") || null,

      role: formValue(formData, "role") as StaffRole,

      name: formValue(formData, "name"),

      email: formValue(formData, "email"),

      username:
        formValue(formData, "username") || null,

      phone: formValue(formData, "phone") || null,

      isActive:
        formValue(formData, "isActive") === "true",

      shiftStart:
        formValue(formData, "shiftStart") || null,

      shiftEnd:
        formValue(formData, "shiftEnd") || null,

      password:
        formValue(formData, "password") || null,
    };

    const action = async () => {
      const form = new FormData();

      if (staff) {
        form.set("id", staff.id);
      }

      form.set("branchId", payload.branchId);

      form.set(
        "departmentId",
        payload.departmentId ?? ""
      );

      form.set("role", payload.role);

      form.set("name", payload.name);

      form.set("email", payload.email);

      form.set(
        "username",
        payload.username ?? ""
      );

      form.set("phone", payload.phone ?? "");

      form.set(
        "isActive",
        payload.isActive ? "true" : "false"
      );
      form.set("shiftStart", "" );
      form.set("shiftEnd",  "");

      form.set("password", payload.password ?? "");

      return staff
        ? await updateStaffAction(form)
        : await createStaffAction(form);
    };

    startTransition(() => {
      void action().then((nextResult) => {
        setResult(nextResult);

        if (nextResult.ok) {
          router.push("/settings/staff-manage" as any);
        }
      });
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={"/settings/staff-manage" as any}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              <ArrowLeft
                className="h-5 w-5"
                aria-hidden
              />
            </Link>

            <div>
              <h1 className="text-3xl font-semibold text-slate-900">
                {staff
                  ? "Edit Staff Member"
                  : "Add Staff Member"}
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                Configure staff profile,
                branch and department
                assignments, role, and
                working details.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
            <ShieldCheck
              className="h-4 w-4"
              aria-hidden
            />
            Staff Management
          </div>
        </div>

        {result ? (
          <div
            className={cn(
              "mb-6 rounded-2xl border px-4 py-3 text-sm font-medium",
              result.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            )}
          >
            {result.message}
          </div>
        ) : null}

        <form action={submit} className="grid gap-6">
          {staff ? (
            <input
              type="hidden"
              name="id"
              value={staff.id}
            />
          ) : null}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                <User
                  className="h-5 w-5"
                  aria-hidden
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Staff profile
                </h2>

                <p className="text-sm text-slate-600">
                  Assign staff to a branch,
                  department, and role.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <SelectField
                label="Branch"
                name="branchId"
                defaultValue={staff?.branchId}
                error={fieldError(result, "branchId")}
                required
              >
                <option value="">
                  Select a branch
                </option>

                {branches.map((branch) => (
                  <option
                    key={branch.id}
                    value={branch.id}
                  >
                    {branch.name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Department"
                name="departmentId"
                defaultValue={
                  staff?.departmentId ?? ""
                }
                error={fieldError(
                  result,
                  "departmentId"
                )}
              >
                <option value="">
                  No department assigned
                </option>

                {departments.map((department) => (
                  <option
                    key={department.id}
                    value={department.id}
                  >
                    {department.name}
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <SelectField
                label="Role"
                name="role"
                defaultValue={selectedRole}
                error={fieldError(result, "role")}
                onChange={(value) =>
                  setSelectedRole(
                    value as StaffRole
                  )
                }
                required
              >
                {staffRoles.map((role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Status"
                name="isActive"
                defaultValue={
                  staff
                    ? String(staff.isActive)
                    : "true"
                }
                error={fieldError(
                  result,
                  "isActive"
                )}
                required
              >
                <option value="true">
                  Active
                </option>

                <option value="false">
                  Inactive
                </option>
              </SelectField>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <TextField
                label="Full Name"
                name="name"
                value={fullName}
                error={fieldError(result, "name")}
                required
                onChange={handleNameChange}
              />

              <TextField
                label="Email Address"
                name="email"
                type="email"
                defaultValue={staff?.email}
                error={fieldError(result, "email")}
                required
              />
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <TextField
                label="Username"
                name="username"
                value={username}
                error={fieldError(
                  result,
                  "username"
                )}
                hint={`Auto-generated username: ${generatedUsername}`}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
              />

              <TextField
                label="Phone"
                name="phone"
                type="tel"
                defaultValue={staff?.phone}
                error={fieldError(result, "phone")}
              />
            </div>
            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                <ShieldCheck
                  className="h-4 w-4"
                  aria-hidden
                />
                Role permissions
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {rolePermissions[selectedRole].map(
                  (permission) => (
                    <span
                      key={permission}
                      className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold capitalize text-blue-700 ring-1 ring-blue-100"
                    >
                      {permissionLabel(
                        permission
                      )}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <TextField
                label={
                  staff
                    ? "New Password"
                    : "Password"
                }
                name="password"
                type="password"
                defaultValue=""
                error={fieldError(
                  result,
                  "password"
                )}
                hint={
                  staff
                    ? "Leave blank to keep existing password."
                    : "Create a password for the staff account."
                }
              />

              <div className="grid gap-2 text-sm">
                <span className="font-medium text-slate-900">
                  Account details
                </span>

                <p className="text-sm text-slate-600">
                  A staff member can sign
                  in once a valid password
                  is set.
                </p>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="grid gap-1 text-sm text-slate-600">
              <span className="font-medium text-slate-900">
                Save changes
              </span>

              <p>
                Update staffing assignments
                and access details for the
                clinic team.
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {staff
                ? "Update Staff"
                : "Create Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}