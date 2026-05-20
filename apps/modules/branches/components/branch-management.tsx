"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Building2, Clock3, Edit3, MapPin, Plus, Star, Trash2 } from "lucide-react";
import { cn } from "@mediclinic/ui";
import { DatePickerField, Select2Field } from "@/components/form-controls";
import { createBranchAction, deleteBranchAction, updateBranchAction, type BranchActionState } from "../actions/branch.actions";
import { branchStatuses, branchUpsertSchema, defaultOperatingHours, type BranchStatus, type OperatingHoursInput } from "../validations/branch.validation";
import { DrawerForm, StatusBadge } from "../../../web/components/enterprise-ui";

type RelationCounts = {
  doctors: number;
  departments: number;
  staff: number;
  appointments: number;
  billing: number;
  payroll: number;
};

export type BranchRecord = {
  id: string;
  name: string;
  npi: string | null;
  profile: string;
  phone: string;
  email: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  timezone: string;
  status: BranchStatus;
  isMain: boolean;
  operatingHours: OperatingHoursInput;
  updatedAt: string;
  relations: RelationCounts;
};

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const relationLabels: Array<{ key: keyof RelationCounts; label: string }> = [
  { key: "doctors", label: "Doctors" },
  { key: "departments", label: "Departments" },
  { key: "staff", label: "Staff" },
  { key: "appointments", label: "Appointments" },
  { key: "billing", label: "Billing" },
  { key: "payroll", label: "Payroll" }
];

function normalizeHours(value: unknown): OperatingHoursInput {
  const parsed = branchUpsertSchema.shape.operatingHours.safeParse(value);
  return parsed.success ? parsed.data : defaultOperatingHours;
}

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

function statusTone(status: BranchStatus) {
  if (status === "active") return "success";
  if (status === "maintenance") return "warning";
  return "neutral";
}

function fieldError(result: BranchActionState | null, field: string) {
  return result?.fieldErrors?.[field]?.[0];
}

function TextField({
  label,
  name,
  defaultValue,
  error,
  type = "text",
  required = false
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  error?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        className={cn("h-10 rounded-lg border bg-background px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20", error && "border-red-300")}
      />
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

export function BranchManagement({ branches }: { branches: BranchRecord[] }) {
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id ?? "");
  const [editing, setEditing] = useState<BranchRecord | null>(null);
  const [isCreating, setIsCreating] = useState(branches.length === 0);
  const [result, setResult] = useState<BranchActionState | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedBranch = useMemo(() => branches.find((branch) => branch.id === selectedBranchId) ?? branches[0], [branches, selectedBranchId]);
  const formBranch = editing;

  function openCreate() {
    setResult(null);
    setEditing(null);
    setIsCreating(true);
  }

  function openEdit(branch: BranchRecord) {
    setResult(null);
    setEditing(branch);
    setIsCreating(false);
  }

  function closeDrawer() {
    setResult(null);
    setEditing(null);
    setIsCreating(false);
  }

  function submitBranch(formData: FormData) {
    const parsed = branchUpsertSchema.safeParse(payloadFromForm(formData));
    if (!parsed.success) {
      setResult({ ok: false, message: "Please fix the highlighted branch details.", fieldErrors: parsed.error.flatten().fieldErrors });
      return;
    }

    startTransition(() => {
      void (formBranch ? updateBranchAction(formData) : createBranchAction(formData)).then((nextResult) => {
        setResult(nextResult);
        if (nextResult.ok) closeDrawer();
      });
    });
  }

  function submitDelete(id: string) {
    const formData = new FormData();
    formData.set("id", id);
    startTransition(() => {
      void deleteBranchAction(formData).then(setResult);
    });
  }

  const drawerOpen = isCreating || Boolean(editing);
  const hours = normalizeHours(formBranch?.operatingHours);

  return (
    <section className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Branch Management</h1>
            <p className="text-sm text-muted-foreground">Create, operate, and govern clinic locations.</p>
          </div>
          <Link href="/settings/branches/create" className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground" aria-label="Create branch">
            <Plus className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {result ? (
          <p className={cn("rounded-lg border px-3 py-2 text-sm font-medium", result.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
            {result.message}
          </p>
        ) : null}

        <div className="space-y-2">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className={cn("rounded-lg border bg-card/84 p-4 transition hover:border-primary", selectedBranch?.id === branch.id && "border-primary ring-2 ring-primary/15")}
            >
              <button onClick={() => setSelectedBranchId(branch.id)} className="w-full text-left">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{branch.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {branch.city}, {branch.state}
                    </p>
                  </div>
                  {branch.isMain ? <Star className="h-4 w-4 fill-primary text-primary" aria-label="Main branch" /> : null}
                </div>
              </button>
              <div className="mt-3 flex items-center gap-2">
                <StatusBadge tone={statusTone(branch.status)}>{branch.status}</StatusBadge>
                <span className="text-xs text-muted-foreground">{branch.relations.staff} staff</span>
                <Link href={`/settings/branches/${branch.id}`} className="ml-auto text-xs font-semibold text-primary">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedBranch ? (
        <div className="space-y-5">
          <section className="rounded-lg border bg-card/84 p-5 shadow-sm backdrop-blur">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{selectedBranch.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedBranch.npi ? `NPI ${selectedBranch.npi}` : "No NPI recorded"}</p>
                  </div>
                </div>
                {selectedBranch.profile ? <p className="mt-4 max-w-3xl text-sm text-muted-foreground">{selectedBranch.profile}</p> : null}
              </div>
              <div className="flex gap-2">
                <Link href={`/settings/branches/${selectedBranch.id}/edit`} className="grid h-10 w-10 place-items-center rounded-lg border bg-background" aria-label="Edit branch">
                  <Edit3 className="h-4 w-4" aria-hidden />
                </Link>
                <button
                  onClick={() => submitDelete(selectedBranch.id)}
                  disabled={isPending || selectedBranch.isMain}
                  className="grid h-10 w-10 place-items-center rounded-lg border bg-background text-red-600 disabled:cursor-not-allowed disabled:opacity-45"
                  aria-label="Delete branch"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-background/70 p-4">
                <MapPin className="mb-3 h-4 w-4 text-primary" aria-hidden />
                <p className="text-sm font-semibold">Address</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedBranch.addressLine1}
                  {selectedBranch.addressLine2 ? `, ${selectedBranch.addressLine2}` : ""}
                  <br />
                  {selectedBranch.city}, {selectedBranch.state} {selectedBranch.postalCode}
                </p>
              </div>
              <div className="rounded-lg border bg-background/70 p-4">
                <Clock3 className="mb-3 h-4 w-4 text-primary" aria-hidden />
                <p className="text-sm font-semibold">Contact</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedBranch.phone}
                  <br />
                  {selectedBranch.email ?? "No email recorded"}
                </p>
              </div>
              <div className="rounded-lg border bg-background/70 p-4">
                <Star className="mb-3 h-4 w-4 text-primary" aria-hidden />
                <p className="text-sm font-semibold">Status</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedBranch.isMain ? "Main branch" : "Secondary branch"}
                  <br />
                  {selectedBranch.timezone}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-card/84 p-5 shadow-sm backdrop-blur">
            <h2 className="text-base font-semibold">Branch Relations</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {relationLabels.map((relation) => (
                <div key={relation.key} className="rounded-lg border bg-background/70 p-4">
                  <p className="text-2xl font-semibold">{selectedBranch.relations[relation.key]}</p>
                  <p className="text-sm text-muted-foreground">{relation.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border bg-card/84 p-5 shadow-sm backdrop-blur">
            <h2 className="text-base font-semibold">Operating Hours</h2>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {days.map((day) => {
                const dayHours = selectedBranch.operatingHours[day] ?? defaultOperatingHours[day];
                return (
                  <div key={day} className="flex items-center justify-between rounded-lg border bg-background/70 px-3 py-2 text-sm">
                    <span className="capitalize">{day}</span>
                    <span className="font-medium text-muted-foreground">{dayHours.closed ? "Closed" : `${dayHours.open} - ${dayHours.close}`}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      ) : (
        <div className="rounded-lg border bg-card/84 p-8 text-center">
          <Building2 className="mx-auto h-8 w-8 text-primary" aria-hidden />
          <h2 className="mt-3 text-lg font-semibold">No branches yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create the main branch to begin configuring clinic operations.</p>
        </div>
      )}

      <DrawerForm title={formBranch ? "Edit Branch" : "Create Branch"} open={drawerOpen} onClose={closeDrawer}>
        <form
          key={formBranch?.id ?? "create"}
          action={submitBranch}
          className="space-y-5"
        >
          {formBranch ? <input type="hidden" name="id" value={formBranch.id} /> : null}

          <div className="grid gap-3 md:grid-cols-2">
            <TextField label="Branch name" name="name" required defaultValue={formBranch?.name} error={fieldError(result, "name")} />
            <TextField label="NPI" name="npi" defaultValue={formBranch?.npi} error={fieldError(result, "npi")} />
            <TextField label="Phone" name="phone" required defaultValue={formBranch?.phone} error={fieldError(result, "phone")} />
            <TextField label="Email" name="email" type="email" defaultValue={formBranch?.email} error={fieldError(result, "email")} />
          </div>

          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Branch profile</span>
            <textarea
              name="profile"
              defaultValue={formBranch?.profile ?? ""}
              rows={4}
              className="rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <div className="grid gap-3">
            <TextField label="Address line 1" name="addressLine1" required defaultValue={formBranch?.addressLine1} error={fieldError(result, "addressLine1")} />
            <TextField label="Address line 2" name="addressLine2" defaultValue={formBranch?.addressLine2} error={fieldError(result, "addressLine2")} />
            <div className="grid gap-3 md:grid-cols-[1fr_90px_120px]">
              <TextField label="City" name="city" required defaultValue={formBranch?.city} error={fieldError(result, "city")} />
              <TextField label="State" name="state" required defaultValue={formBranch?.state} error={fieldError(result, "state")} />
              <TextField label="ZIP" name="postalCode" required defaultValue={formBranch?.postalCode} error={fieldError(result, "postalCode")} />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <TextField label="Timezone" name="timezone" required defaultValue={formBranch?.timezone ?? "America/New_York"} error={fieldError(result, "timezone")} />
            <Select2Field label="Status" name="status" defaultValue={formBranch?.status ?? "active"} className="h-10">
              {branchStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select2Field>
          </div>

          <label className="flex items-center gap-2 rounded-lg border bg-background/70 px-3 py-2 text-sm font-medium">
            <input name="isMain" type="checkbox" defaultChecked={formBranch?.isMain ?? branches.length === 0} />
            Main branch
          </label>

          <div>
            <h3 className="text-sm font-semibold">Operating hours</h3>
            <div className="mt-3 space-y-2">
              {days.map((day) => (
                <div key={day} className="grid gap-2 rounded-lg border bg-background/70 p-3 sm:grid-cols-[1fr_96px_96px_auto] sm:items-center">
                  <span className="text-sm font-medium capitalize">{day}</span>
                  <DatePickerField name={`${day}Open`} type="time" defaultValue={hours[day].open} className="h-9 rounded-lg bg-background px-2 text-sm" />
                  <DatePickerField name={`${day}Close`} type="time" defaultValue={hours[day].close} className="h-9 rounded-lg bg-background px-2 text-sm" />
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input name={`${day}Closed`} type="checkbox" defaultChecked={hours[day].closed} />
                    Closed
                  </label>
                </div>
              ))}
            </div>
          </div>

          {result && !result.ok ? <p className="rounded-lg border bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{result.message}</p> : null}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={closeDrawer} className="rounded-lg border bg-background px-4 py-2 text-sm font-semibold">
              Cancel
            </button>
            <button disabled={isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {isPending ? "Saving..." : "Save branch"}
            </button>
          </div>
        </form>
      </DrawerForm>
    </section>
  );
}
