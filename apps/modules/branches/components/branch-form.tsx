"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, Building2, MapPin, Phone, Mail, Globe, Clock } from "lucide-react";
import { cn } from "@mediclinic/ui";
import { DatePickerField, Select2Field } from "@/components/form-controls";
import { createBranchAction, updateBranchAction, type BranchActionState } from "../actions/branch.actions";
import { branchStatuses, branchUpsertSchema, defaultOperatingHours, type OperatingHoursInput } from "../validations/branch.validation";
import type { BranchRecord } from "./branch-management";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

function value(formData: FormData, key: string) {
  const item = formData.get(key);
  return typeof item === "string" ? item : "";
}

function payloadFromForm(formData: FormData) {
  return {
    name: value(formData, "name"),
    npi: value(formData, "npi"),
    profile: value(formData, "profile"),
    phone: value(formData, "phone"),
    email: value(formData, "email"),
    addressLine1: value(formData, "addressLine1"),
    addressLine2: value(formData, "addressLine2"),
    city: value(formData, "city"),
    state: value(formData, "state").toUpperCase(),
    postalCode: value(formData, "postalCode"),
    timezone: value(formData, "timezone"),
    status: value(formData, "status"),
    isMain: formData.get("isMain") === "on",
    operatingHours: days.reduce((hours, day) => {
      hours[day] = {
        open: value(formData, `${day}Open`),
        close: value(formData, `${day}Close`),
        closed: formData.get(`${day}Closed`) === "on"
      };
      return hours;
    }, {} as OperatingHoursInput)
  };
}

function fieldError(result: BranchActionState | null, field: string) {
  return result?.fieldErrors?.[field]?.[0];
}

function FormField({
  label,
  name,
  defaultValue,
  error,
  type = "text",
  required = false,
  icon: Icon
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  error?: string;
  type?: string;
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  if (type === "date" || type === "time") {
    return <DatePickerField label={label} name={name} type={type} required={required} defaultValue={defaultValue ?? ""} error={error} />;
  }

  return (
    <div className="grid gap-2">
      <label className="flex items-center gap-2 text-sm font-medium text-[#666666]">
        {Icon && <Icon className="h-4 w-4 text-[#888888]" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        className={cn(
          "h-12 rounded-[14px] border border-[#e5e5e5] bg-[#ffffff] px-4 text-sm outline-none transition-all placeholder:text-[#999999]",
          "focus:border-[#888888] focus:ring-2 focus:ring-[#888888]/10",
          error && "border-red-400 focus:border-red-500"
        )}
      />
      {error ? <span className="text-xs font-medium text-red-500">{error}</span> : null}
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  icon: Icon
}: {
  label: string;
  name: string;
  defaultValue?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="grid gap-2">
      <Select2Field label={label} name={name} defaultValue={defaultValue ?? "active"}>
        {branchStatuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </Select2Field>
    </div>
  );
}

function TimeInput({
  name,
  defaultValue,
  day,
  closed
}: {
  name: string;
  defaultValue?: string;
  day: string;
  closed?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-[#e5e5e5] bg-[#ffffff] p-4">
      <span className="w-24 text-sm font-medium capitalize text-[#000000]">{day}</span>
      <div className="flex flex-1 items-center gap-3">
        <DatePickerField name={`${day}Open`} type="time" defaultValue={defaultValue} disabled={closed} className="h-10 flex-1 rounded-[12px] bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50" />
        <span className="text-sm text-[#666666]">to</span>
        <DatePickerField name={`${day}Close`} type="time" defaultValue={defaultValue} disabled={closed} className="h-10 flex-1 rounded-[12px] bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50" />
        <label className="ml-auto flex items-center gap-2 text-sm">
          <input
            name={`${day}Closed`}
            type="checkbox"
            defaultChecked={closed}
            className="h-4 w-4 cursor-pointer rounded border-[#e5e5e5] accent-[#888888]"
          />
          <span className="text-[#666666]">Closed</span>
        </label>
      </div>
    </div>
  );
}

export function BranchForm({ branch }: { branch?: BranchRecord }) {
  const router = useRouter();
  const [result, setResult] = useState<BranchActionState | null>(null);
  const [isPending, startTransition] = useTransition();
  const hours = branch?.operatingHours ?? defaultOperatingHours;

  function submit(formData: FormData) {
    const parsed = branchUpsertSchema.safeParse(payloadFromForm(formData));
    if (!parsed.success) {
      setResult({ ok: false, message: "Please fix the highlighted branch details.", fieldErrors: parsed.error.flatten().fieldErrors });
      return;
    }

    startTransition(() => {
      void (branch ? updateBranchAction(formData) : createBranchAction(formData)).then((nextResult) => {
        setResult(nextResult);
        if (nextResult.ok) router.push((branch ? `/settings/branches/${branch.id}` : "/settings/branches") as any);
      });
    });
  }

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="grid h-12 w-12 cursor-pointer place-items-center rounded-[14px] border border-[#e5e5e5] bg-[#ffffff] text-[#666666] transition-all hover:border-[#888888] hover:text-[#888888]"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-[#000000]">
                {branch ? "Edit Branch" : "Create Branch"}
              </h1>
              <p className="mt-1 text-sm text-[#666666]">
                Manage profile, address, contact details, status, and hours
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-[14px] bg-[#888888] px-5 py-3 text-sm font-semibold text-[#ffffff]">
            <Building2 className="h-4 w-4" aria-hidden />
            Branch Settings
          </div>
        </div>

        {result && (
          <div
            className={cn(
              "mb-6 rounded-[14px] border px-4 py-3 text-sm font-medium",
              result.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            )}
          >
            {result.message}
          </div>
        )}

        <form action={submit} className="space-y-6">
          {branch && <input type="hidden" name="id" value={branch.id} />}

          <div className="rounded-[18px] border border-[#e5e5e5] bg-[#ffffff] p-6 shadow-[rgba(0,0,0,0.05)_0px_1px_3px_0px,rgba(0,0,0,0.05)_0px_1px_2px_-1px]">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#888888]/10 text-[#888888]">
                <Building2 className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#000000]">Branch Information</h2>
                <p className="text-sm text-[#666666]">Basic details about your branch</p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Branch Name" name="name" required defaultValue={branch?.name} error={fieldError(result, "name")} />
              <FormField label="NPI Number" name="npi" defaultValue={branch?.npi} error={fieldError(result, "npi")} />
              <FormField label="Phone Number" name="phone" required defaultValue={branch?.phone} error={fieldError(result, "phone")} icon={Phone} />
              <FormField label="Email Address" name="email" type="email" defaultValue={branch?.email} error={fieldError(result, "email")} icon={Mail} />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-[#666666]">Branch Profile</label>
              <textarea
                name="profile"
                defaultValue={branch?.profile ?? ""}
                rows={4}
                placeholder="Describe your branch, services offered, and specializations..."
                className="w-full resize-none rounded-[14px] border border-[#e5e5e5] bg-[#ffffff] px-4 py-3 text-sm outline-none transition-all placeholder:text-[#999999] focus:border-[#888888] focus:ring-2 focus:ring-[#888888]/10"
              />
            </div>
          </div>

          <div className="rounded-[18px] border border-[#e5e5e5] bg-[#ffffff] p-6 shadow-[rgba(0,0,0,0.05)_0px_1px_3px_0px,rgba(0,0,0,0.05)_0px_1px_2px_-1px]">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#888888]/10 text-[#888888]">
                <MapPin className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#000000]">Location Details</h2>
                <p className="text-sm text-[#666666]">Address and geographic information</p>
              </div>
            </div>

            <div className="grid gap-5">
              <FormField label="Address Line 1" name="addressLine1" required defaultValue={branch?.addressLine1} error={fieldError(result, "addressLine1")} />
              <FormField label="Address Line 2" name="addressLine2" defaultValue={branch?.addressLine2} error={fieldError(result, "addressLine2")} />
              <div className="grid gap-5 md:grid-cols-[1fr_100px_140px]">
                <FormField label="City" name="city" required defaultValue={branch?.city} error={fieldError(result, "city")} />
                <FormField label="State" name="state" required defaultValue={branch?.state} error={fieldError(result, "state")} />
                <FormField label="ZIP Code" name="postalCode" required defaultValue={branch?.postalCode} error={fieldError(result, "postalCode")} />
              </div>
            </div>
          </div>

          <div className="rounded-[18px] border border-[#e5e5e5] bg-[#ffffff] p-6 shadow-[rgba(0,0,0,0.05)_0px_1px_3px_0px,rgba(0,0,0,0.05)_0px_1px_2px_-1px]">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#888888]/10 text-[#888888]">
                <Globe className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#000000]">Branch Settings</h2>
                <p className="text-sm text-[#666666]">Timezone, status, and branch type</p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Timezone" name="timezone" required defaultValue={branch?.timezone ?? "America/New_York"} error={fieldError(result, "timezone")} icon={Globe} />
              <SelectField label="Branch Status" name="status" defaultValue={branch?.status ?? "active"} />
            </div>

            <div className="mt-5">
              <label className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-[#e5e5e5] bg-[#fafafa] p-4 transition-all hover:border-[#888888]">
                <input
                  name="isMain"
                  type="checkbox"
                  defaultChecked={branch?.isMain ?? false}
                  className="h-5 w-5 cursor-pointer rounded border-[#e5e5e5] accent-[#888888]"
                />
                <div>
                  <span className="text-sm font-medium text-[#000000]">Main Branch</span>
                  <p className="text-xs text-[#666666]">Mark this as the primary branch location</p>
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-[18px] border border-[#e5e5e5] bg-[#ffffff] p-6 shadow-[rgba(0,0,0,0.05)_0px_1px_3px_0px,rgba(0,0,0,0.05)_0px_1px_2px_-1px]">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#888888]/10 text-[#888888]">
                <Clock className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#000000]">Operating Hours</h2>
                <p className="text-sm text-[#666666]">Define your branch working schedule</p>
              </div>
            </div>

            <div className="space-y-3">
              {days.map((day) => (
                <TimeInput
                  key={day}
                  name={day}
                  day={day}
                  defaultValue={hours[day].open}
                  closed={hours[day].closed}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="h-12 cursor-pointer rounded-[14px] border border-[#e5e5e5] bg-[#ffffff] px-6 text-sm font-semibold text-[#666666] transition-all hover:border-[#888888] hover:text-[#888888]"
            >
              Cancel
            </button>
            <button
              disabled={isPending}
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[#888888] px-8 text-sm font-semibold text-[#ffffff] transition-all hover:bg-[#666666] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save Branch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
