"use client";

import Link from "next/link";
import { Bot, CalendarClock, CalendarX2, CircleDollarSign, Clock3, Stethoscope, UserCog } from "lucide-react";
import { StatusBadge } from "@/components/enterprise-ui";
import type { DoctorRecord } from "../types/doctor.types";

function currency(value: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value));
}

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function DoctorsView({ doctors, canManage }: { doctors: DoctorRecord[]; canManage: boolean }) {
  const activeDoctors = doctors.filter((doctor) => doctor.isActive).length;
  const averageVisit = doctors.length > 0 ? Math.round(doctors.reduce((total, doctor) => total + doctor.visitDurationMinutes, 0) / doctors.length) : 0;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Doctor Management</h1>
          <p className="mt-2 text-sm text-slate-600">
            Admins manage doctor accounts plus branch and department assignment. Doctors manage fees, schedules, availability, leave, and calendar sync from their own profile.
          </p>
        </div>
        {canManage ? (
          <Link href="/settings/staff-manage/create" className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
            <UserCog className="h-4 w-4" aria-hidden />
            Add doctor account
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Active doctors</p>
          <p className="mt-2 text-3xl font-semibold">{activeDoctors}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Average visit</p>
          <p className="mt-2 text-3xl font-semibold">{averageVisit || 0} min</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Booked appointments</p>
          <p className="mt-2 text-3xl font-semibold">{doctors.reduce((total, doctor) => total + doctor.appointmentCount, 0)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-semibold">Doctor</th>
                <th className="px-5 py-4 font-semibold">Specialty</th>
                <th className="px-5 py-4 font-semibold">Assignment</th>
                <th className="px-5 py-4 font-semibold">Fee</th>
                <th className="px-5 py-4 font-semibold">Doctor-owned schedule</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Admin action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="transition hover:bg-muted/40">
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-700">
                        <Stethoscope className="h-5 w-5" aria-hidden />
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{doctor.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{doctor.email}</p>
                        <p className="mt-1 text-xs text-slate-500">{doctor.phone ?? "No phone recorded"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{doctor.specialty}</p>
                    <p className="mt-1 text-xs text-slate-500">License {doctor.licenseNumber}</p>
                    <p className="mt-1 text-xs text-slate-500">{doctor.experienceYears} years experience</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <p>{doctor.branchName ?? "No branch"}</p>
                    <p className="mt-1 text-xs">{doctor.departmentName ?? "No department"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <CircleDollarSign className="h-3.5 w-3.5" aria-hidden />
                      {currency(doctor.consultationFee)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                      {doctor.visitDurationMinutes} min slots
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs">
                      <CalendarClock className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                      {doctor.appointmentCount} appointments
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge tone={doctor.isActive ? "success" : "neutral"}>{doctor.isActive ? "Active" : "Inactive"}</StatusBadge>
                    <p className="mt-2 text-xs text-slate-500">Updated {dateLabel(doctor.updatedAt)}</p>
                  </td>
                  <td className="px-5 py-4">
                    {canManage ? (
                      <Link href={`/settings/staff-manage/${doctor.userId}/edit`} className="rounded-lg px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10">
                        Edit profile
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-500">Directory view</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
            Availability slots
          </div>
          <p className="mt-3 text-sm text-slate-600">Doctors own slot setup. Admins use the resulting capacity for booking and branch operations.</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <CalendarX2 className="h-4 w-4 text-primary" aria-hidden />
            Leave and block dates
          </div>
          <p className="mt-3 text-sm text-slate-600">Doctors manage leave and block dates. Admins should see blocked capacity but not own the doctor schedule.</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Bot className="h-4 w-4 text-primary" aria-hidden />
            AI scheduling
          </div>
          <p className="mt-3 text-sm text-slate-600">AI optimization and slot recommendations belong on appointment scheduling once availability history exists.</p>
        </div>
      </div>
    </section>
  );
}
