"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Clock3, X, AlertTriangle, Mail } from "lucide-react";
import { rolePermissions } from "@mediclinic/rbac";
import { StatusBadge } from "@/components/enterprise-ui";
import type { StaffRecord } from "../types/staff.types";
import { deleteStaffAction } from "../actions/staff.actions";

function statusTone(isActive: boolean) {
  return isActive ? "success" : "neutral";
}

function permissionLabel(permission: string) {
  return permission.replace(/\./g, " ");
}

function DeleteConfirmDialog({
  open,
  name,
  onConfirm,
  onCancel
}: {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 px-4">
      <section className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Delete Staff Member</h2>
          <button onClick={onCancel} className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-slate-300">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>
        <div className="p-5">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-red-50 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" aria-hidden />
            <p className="text-sm text-red-700">This action cannot be undone. All staff data will be permanently removed.</p>
          </div>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <span className="font-semibold text-slate-900">{name}</span>?
          </p>
        </div>
        <footer className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
          <button
            onClick={onCancel}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="h-11 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Delete Staff
          </button>
        </footer>
      </section>
    </div>
  );
}

export function StaffDetail({ staff }: { staff: StaffRecord }) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const formData = new FormData();
    formData.set("id", staff.id);
    await deleteStaffAction(formData);
    router.push("/settings/staff-manage" as any);
  }

  return (
    <>
      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{staff.name}</h1>
            <p className="mt-2 text-sm text-slate-600">Staff profile, assignments, account status, and working schedule.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge tone={statusTone(staff.isActive)}>{staff.isActive ? "Active" : "Inactive"}</StatusBadge>
            <Link href={"/settings/staff-manage" as any} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
              Back to staff
            </Link>
            <Link href={`/settings/staff-manage/${staff.id}/edit`} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
              Edit staff
            </Link>
            <button
              onClick={() => setShowDelete(true)}
              className="rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-slate-700">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                <User className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Staff information</h2>
                <p className="text-sm text-slate-500">Personal and account details for this team member.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 text-sm text-slate-700">
              <div className="grid gap-1">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Role</span>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">{staff.role}</span>
              </div>
              <div className="grid gap-1">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Branch</span>
                <p className="font-semibold text-slate-900">{staff.branchName ?? "Unassigned"}</p>
              </div>
              <div className="grid gap-1">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Department</span>
                <p className="font-semibold text-slate-900">{staff.departmentName ?? "Unassigned"}</p>
              </div>
              <div className="grid gap-1">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Username</span>
                <p className="font-semibold text-slate-900">{staff.username ?? "Not set"}</p>
              </div>
              <div className="grid gap-1">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Last login</span>
                <p>{staff.lastLoginAt ? new Date(staff.lastLoginAt).toLocaleString() : "Never logged in"}</p>
              </div>
              <div className="grid gap-1">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Last updated</span>
                <p>{new Date(staff.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                  <Mail className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
                  <p className="text-sm text-slate-500">Email and phone details on file.</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 text-sm text-slate-700">
                <div className="grid gap-1">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Email address</span>
                  <p className="font-semibold text-slate-900">{staff.email}</p>
                </div>
                <div className="grid gap-1">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Phone</span>
                  <p>{staff.phone ?? "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                  <Clock3 className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Shift schedule</h2>
                  <p className="text-sm text-slate-500">Planned start and end times for the staff member.</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 text-sm text-slate-700">
                <div className="grid gap-1">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Shift start</span>
                  <p className="font-semibold text-slate-900">{staff.shiftStart ?? "Not set"}</p>
                </div>
                <div className="grid gap-1">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Shift end</span>
                  <p className="font-semibold text-slate-900">{staff.shiftEnd ?? "Not set"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Staff permissions</h2>
                  <p className="text-sm text-slate-500">Access granted through the assigned role.</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {rolePermissions[staff.role].map((permission) => (
                  <span key={permission} className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold capitalize text-blue-700">
                    {permissionLabel(permission)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <DeleteConfirmDialog
        open={showDelete}
        name={staff.name}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </>
  );
}
