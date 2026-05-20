"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, Clock3, Edit3, MapPin, Star, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/enterprise-ui";
import { cn } from "@mediclinic/ui";
import { deleteBranchAction, type BranchActionState } from "../actions/branch.actions";
import { defaultOperatingHours, type BranchStatus } from "../validations/branch.validation";
import type { BranchRecord } from "./branch-management";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const relationLabels = [
  ["doctors", "Doctors"],
  ["departments", "Departments"],
  ["staff", "Staff"],
  ["appointments", "Appointments"],
  ["billing", "Billing"],
  ["payroll", "Payroll"]
] as const;

function statusTone(status: BranchStatus) {
  if (status === "active") return "success";
  if (status === "maintenance") return "warning";
  return "neutral";
}

export function BranchDetail({ branch }: { branch: BranchRecord }) {
  const router = useRouter();
  const [result, setResult] = useState<BranchActionState | null>(null);
  const [isPending, startTransition] = useTransition();

  function submitDelete() {
    const formData = new FormData();
    formData.set("id", branch.id);
    startTransition(() => {
      void deleteBranchAction(formData).then((nextResult) => {
        setResult(nextResult);
        if (nextResult.ok) router.push("/settings/branches" as any);
      });
    });
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-semibold">{branch.name}</h1>
          <p className="text-sm text-muted-foreground">{branch.npi ? `NPI ${branch.npi}` : "No NPI recorded"}</p>
        </div>
        <div className="flex gap-2">
          <Link href={"/settings/branches" as any} className="grid h-10 w-10 place-items-center rounded-lg border bg-card" aria-label="Back to branches">
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Link>
          <Link href={`/settings/branches/${branch.id}/edit` as any} className="grid h-10 w-10 place-items-center rounded-lg border bg-card" aria-label="Edit branch">
            <Edit3 className="h-4 w-4" aria-hidden />
          </Link>
          <button
            onClick={submitDelete}
            disabled={isPending || branch.isMain}
            className="grid h-10 w-10 place-items-center rounded-lg border bg-card text-red-600 disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Delete branch"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {result ? (
        <p className={cn("rounded-lg border px-3 py-2 text-sm font-medium", result.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
          {result.message}
        </p>
      ) : null}

      <section className="rounded-lg border bg-card/84 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={statusTone(branch.status)}>{branch.status}</StatusBadge>
          {branch.isMain ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <Star className="h-3.5 w-3.5 fill-primary" aria-hidden />
              Main branch
            </span>
          ) : null}
        </div>
        {branch.profile ? <p className="mt-4 max-w-3xl text-sm text-muted-foreground">{branch.profile}</p> : null}

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-background/70 p-4">
            <MapPin className="mb-3 h-4 w-4 text-primary" aria-hidden />
            <p className="text-sm font-semibold">Address</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {branch.addressLine1}
              {branch.addressLine2 ? `, ${branch.addressLine2}` : ""}
              <br />
              {branch.city}, {branch.state} {branch.postalCode}
            </p>
          </div>
          <div className="rounded-lg border bg-background/70 p-4">
            <Clock3 className="mb-3 h-4 w-4 text-primary" aria-hidden />
            <p className="text-sm font-semibold">Contact</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {branch.phone}
              <br />
              {branch.email ?? "No email recorded"}
            </p>
          </div>
          <div className="rounded-lg border bg-background/70 p-4">
            <Star className="mb-3 h-4 w-4 text-primary" aria-hidden />
            <p className="text-sm font-semibold">Timezone</p>
            <p className="mt-1 text-sm text-muted-foreground">{branch.timezone}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-card/84 p-5 shadow-sm backdrop-blur">
        <h2 className="text-base font-semibold">Branch Relations</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {relationLabels.map(([key, label]) => (
            <div key={key} className="rounded-lg border bg-background/70 p-4">
              <p className="text-2xl font-semibold">{branch.relations[key]}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-card/84 p-5 shadow-sm backdrop-blur">
        <h2 className="text-base font-semibold">Operating Hours</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {days.map((day) => {
            const hours = branch.operatingHours[day] ?? defaultOperatingHours[day];
            return (
              <div key={day} className="flex items-center justify-between rounded-lg border bg-background/70 px-3 py-2 text-sm">
                <span className="capitalize">{day}</span>
                <span className="font-medium text-muted-foreground">{hours.closed ? "Closed" : `${hours.open} - ${hours.close}`}</span>
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
}
