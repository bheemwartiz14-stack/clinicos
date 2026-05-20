"use client";

import { useState } from "react";
import Link from "next/link";
import { UsersRound, Mail, CalendarCheck, Plus, X, ShieldCheck } from "lucide-react";
import { cn } from "@mediclinic/ui";
import { rolePermissions } from "@mediclinic/rbac";
import { StatusBadge } from "@/components/enterprise-ui";
import { Select2Field } from "@/components/form-controls";
import type { StaffRecord } from "../types/staff.types";
import { staffRoles } from "../validations/staff.validation";

function statusTone(isActive: boolean) {
  return isActive ? "success" : "neutral";
}

function permissionLabel(permission: string) {
  return permission.replace(/\./g, " ");
}

function EmptyState({ onAction }: { onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <UsersRound className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">No staff members found</h3>
      <p className="mt-2 text-sm text-slate-500">Add your first staff member to get started with team management.</p>
      {onAction && (
        <Link
          href="/settings/staff-manage/create"
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add Staff
        </Link>
      )}
    </div>
  );
}

function StaffTable({
  staff,
  onView,
  onEdit,
  onDelete
}: {
  staff: StaffRecord[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50/60 text-xs uppercase tracking-[0.15em] text-slate-500">
            <tr>
              <th className="px-5 py-4 font-semibold">Staff Member</th>
              <th className="px-5 py-4 font-semibold">Role</th>
              <th className="px-5 py-4 font-semibold">Branch</th>
              <th className="px-5 py-4 font-semibold">Department</th>
              <th className="px-5 py-4 font-semibold">Contact</th>
              <th className="px-5 py-4 font-semibold">Shift</th>
              <th className="px-5 py-4 font-semibold">Permissions</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map((member) => (
              <tr key={member.id} className="transition hover:bg-slate-50/60">
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-900">{member.name}</span>
                    {member.username && <span className="text-xs text-slate-400">@{member.username}</span>}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">{member.role}</span>
                </td>
                <td className="px-5 py-4 text-slate-600">{member.branchName ?? "—"}</td>
                <td className="px-5 py-4 text-slate-600">{member.departmentName ?? "—"}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1 text-slate-600">
                    <span className="flex items-center gap-1.5 text-xs">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                      {member.email}
                    </span>
                    {member.phone && <span className="text-xs">{member.phone}</span>}
                  </div>
                </td>
                <td className="px-5 py-4">
                  {member.shiftStart ? (
                    <span className="flex items-center gap-1.5 text-xs text-slate-600">
                      <CalendarCheck className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                      {member.shiftStart} – {member.shiftEnd ?? "?"}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">No shift</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex max-w-48 flex-wrap gap-1.5">
                    {rolePermissions[member.role].slice(0, 3).map((permission) => (
                      <span key={permission} className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-semibold capitalize text-blue-700">
                        {permissionLabel(permission)}
                      </span>
                    ))}
                    {rolePermissions[member.role].length > 3 ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                        <ShieldCheck className="h-3 w-3" aria-hidden />
                        +{rolePermissions[member.role].length - 3}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge tone={statusTone(member.isActive)}>{member.isActive ? "Active" : "Inactive"}</StatusBadge>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onView(member.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEdit(member.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(member.id, member.name)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
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
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <span className="font-semibold text-slate-900">{name}</span>? This action cannot be undone.
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

export function StaffListView({ initialStaff }: { initialStaff: StaffRecord[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const uniqueBranches = Array.from(new Set(initialStaff.map((s) => s.branchName).filter(Boolean))) as string[];

  const filtered = initialStaff.filter((staff) => {
    const matchSearch =
      !search ||
      staff.name.toLowerCase().includes(search.toLowerCase()) ||
      staff.email.toLowerCase().includes(search.toLowerCase()) ||
      (staff.username && staff.username.toLowerCase().includes(search.toLowerCase())) ||
      staff.role.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || staff.role === roleFilter;
    const matchStatus = !statusFilter || (statusFilter === "active" ? staff.isActive : !staff.isActive);
    const matchBranch = !branchFilter || staff.branchName === branchFilter;
    return matchSearch && matchRole && matchStatus && matchBranch;
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const formData = new FormData();
    formData.set("id", deleteTarget.id);
    const { deleteStaffAction } = await import("../actions/staff.actions");
    await deleteStaffAction(formData);
    setIsDeleting(false);
    setDeleteTarget(null);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Staff Management</h1>
          <p className="mt-2 text-sm text-slate-600">Manage clinic staff profiles, branch assignments, roles, permissions, and shift timings.</p>
        </div>
        <Link
          href="/settings/staff-manage/create"
          className="inline-flex h-12 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add Staff
        </Link>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search staff</span>
          <svg className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, username, or role..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "inline-flex h-12 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition",
            showFilters ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          )}
        >
          Filters
          {showFilters && (roleFilter || statusFilter || branchFilter) && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {[roleFilter, statusFilter, branchFilter].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</label>
            <Select2Field
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary"
            >
              <option value="">All roles</option>
              {staffRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </Select2Field>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
            <Select2Field
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select2Field>
          </div>
          {uniqueBranches.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch</label>
              <Select2Field
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary"
              >
                <option value="">All branches</option>
                {uniqueBranches.map((branch) => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </Select2Field>
            </div>
          )}
          {(roleFilter || statusFilter || branchFilter) && (
            <button
              onClick={() => { setRoleFilter(""); setStatusFilter(""); setBranchFilter(""); }}
              className="mt-auto flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
            >
              <X className="h-4 w-4" aria-hidden />
              Clear
            </button>
          )}
        </div>
      )}

      {filtered.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of <span className="font-semibold text-slate-700">{initialStaff.length}</span> staff members
            </p>
          </div>
          <StaffTable
            staff={filtered}
            onView={(id) => { window.location.href = `/settings/staff-manage/${id}`; }}
            onEdit={(id) => { window.location.href = `/settings/staff-manage/${id}/edit`; }}
            onDelete={(id, name) => setDeleteTarget({ id, name })}
          />
        </>
      ) : (
        <EmptyState />
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        name={deleteTarget?.name ?? ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
