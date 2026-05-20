"use client";

import { useActionState } from "react";
import { resetPasswordAction, type AuthActionState } from "../actions/auth.actions";

const initialState: AuthActionState = { ok: false };

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <label className="block text-sm font-medium">
        New password
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          minLength={8}
          required
        />
      </label>
      {state.message ? (
        <p className="rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground">
          {state.message}
          {state.ok ? (
            <a href="/login" className="mt-2 block font-medium text-primary">
              Sign in
            </a>
          ) : null}
        </p>
      ) : null}
      <button disabled={pending} className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-70">
        {pending ? "Resetting..." : "Reset password"}
      </button>
    </form>
  );
}
