"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, type AuthActionState } from "../actions/auth.actions";

const initialState: AuthActionState = { ok: false };

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-medium">
        Email or username
        <input
          name="identifier"
          autoComplete="username"
          className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          required
        />
      </label>
      {state.message ? (
        <p className="rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground">
          {state.message}
          {state.resetToken ? (
            <span className="mt-2 block break-all font-mono text-xs text-foreground">/reset-password?token={state.resetToken}</span>
          ) : null}
        </p>
      ) : null}
      <button disabled={pending} className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-70">
        {pending ? "Preparing reset..." : "Continue"}
      </button>
      <a href="/login" className="block text-center text-sm font-medium text-primary">
        Back to sign in
      </a>
    </form>
  );
}
