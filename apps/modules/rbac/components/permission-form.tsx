"use client";

import { useActionState } from "react";
import { createPermissionAction, type RbacActionState } from "../actions/rbac.actions";

const initialState: RbacActionState = { ok: false, message: "" };

export function PermissionForm() {
  const [state, action, pending] = useActionState(createPermissionAction, initialState);

  return (
    <form action={action} className="rounded-xl border border-border bg-card/80 p-5 shadow-lg shadow-foreground/5 backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-normal text-primary">Permission CRUD</p>
      <h2 className="mt-1 text-xl font-semibold text-foreground">Register permission</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Permission keys are schema validated and protected by rbac.manage before any write attempt.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Permission key
          <input name="id" placeholder="patients.view" className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
          {state.fieldErrors?.id ? <span className="text-xs text-destructive">{state.fieldErrors.id.join(", ")}</span> : null}
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Description
          <input name="description" placeholder="Can view patient records" className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </label>
      </div>
      <div className="sticky bottom-4 mt-5 flex items-center justify-between rounded-lg border border-border bg-background/95 p-3 shadow-lg backdrop-blur">
        <p className={state.message ? (state.ok ? "text-sm text-emerald-600 dark:text-emerald-400" : "text-sm text-destructive") : "text-sm text-muted-foreground"}>
          {state.message || "Changes are checked against secure login permissions."}
        </p>
        <button type="submit" disabled={pending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "Saving..." : "Save permission"}
        </button>
      </div>
    </form>
  );
}
