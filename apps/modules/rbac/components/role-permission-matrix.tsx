"use client";

import { useActionState } from "react";
import { updateRolePermissionsAction, type RbacActionState } from "../actions/rbac.actions";
import type { RbacPermissionRecord, RolePermissionMatrixRow } from "../types/rbac.types";

const initialState: RbacActionState = { ok: false, message: "" };

export function RolePermissionMatrix({ matrix, permissions }: { matrix: RolePermissionMatrixRow[]; permissions: RbacPermissionRecord[] }) {
  const [state, action, pending] = useActionState(updateRolePermissionsAction, initialState);

  return (
    <section className="rounded-xl border border-border bg-card/80 shadow-lg shadow-foreground/5 backdrop-blur">
      <div className="border-b border-border p-5">
        <p className="text-sm font-semibold uppercase tracking-normal text-primary">Role mapping</p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">Role-permission matrix</h2>
        <p className="mt-2 text-sm text-muted-foreground">Review the exact access map used by login sessions, page guards, server actions, and the dashboard sidebar.</p>
        {state.message ? (
          <p className={state.ok ? "mt-3 text-sm text-emerald-600 dark:text-emerald-400" : "mt-3 text-sm text-destructive"}>{state.message}</p>
        ) : null}
      </div>

      <div className="divide-y divide-border">
        {matrix.map((role) => (
          <form key={role.id} action={action} className="grid gap-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <input type="hidden" name="role" value={role.id} />
                <h3 className="text-base font-semibold capitalize text-foreground">{role.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{role.description}</p>
              </div>
              <button type="submit" disabled={pending} className="rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60">
                {pending ? "Validating..." : "Validate mapping"}
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {permissions.map((permission) => (
                <label key={`${role.id}-${permission.id}`} className="flex items-center gap-2 rounded-lg border border-border bg-background/70 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary/30">
                  <input
                    name="permissions"
                    value={permission.id}
                    type="checkbox"
                    defaultChecked={role.permissionState[permission.id]}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <span className="min-w-0 flex-1 truncate font-mono">{permission.name}</span>
                </label>
              ))}
            </div>
          </form>
        ))}
      </div>
    </section>
  );
}
