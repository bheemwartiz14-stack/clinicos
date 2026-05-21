"use client";

import { useActionState } from "react";
import { createRoleAction, type RbacActionState } from "../actions/rbac.actions";
import type { RbacPermissionRecord } from "../types/rbac.types";

const initialState: RbacActionState = { ok: false, message: "" };

export function RoleForm({ permissions }: { permissions: RbacPermissionRecord[] }) {
  const [state, action, pending] = useActionState(createRoleAction, initialState);

  return (
    <form action={action} className="rounded-xl border border-border bg-card/80 p-5 shadow-lg shadow-foreground/5 backdrop-blur">
      <div>
        <p className="text-sm font-semibold uppercase tracking-normal text-primary">Role CRUD</p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">Create system role</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Roles are validated against the secure login RBAC registry. Add persistent custom roles in the shared RBAC package before enabling them here.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Role ID
          <input
            name="id"
            placeholder="admin"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {state.fieldErrors?.id ? <span className="text-xs text-destructive">{state.fieldErrors.id.join(", ")}</span> : null}
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Description
          <input
            name="description"
            placeholder="Controls clinic administration"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-foreground">Default permissions</legend>
        <div className="mt-3 grid max-h-64 gap-2 overflow-auto rounded-lg border border-border bg-background/60 p-3 md:grid-cols-2 xl:grid-cols-3">
          {permissions.map((permission) => (
            <label key={permission.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
              <input name="permissions" value={permission.id} type="checkbox" className="h-4 w-4 rounded border-border accent-primary" />
              <span className="truncate">{permission.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="sticky bottom-4 mt-5 flex items-center justify-between rounded-lg border border-border bg-background/95 p-3 shadow-lg backdrop-blur">
        <p className={state.message ? (state.ok ? "text-sm text-emerald-600 dark:text-emerald-400" : "text-sm text-destructive") : "text-sm text-muted-foreground"}>
          {state.message || "Protected by rbac.manage."}
        </p>
        <button type="submit" disabled={pending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "Saving..." : "Save role"}
        </button>
      </div>
    </form>
  );
}
