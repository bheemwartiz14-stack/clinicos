"use client";

import { useActionState } from "react";
import { requestPasswordResetAction, type AuthActionState } from "../actions/auth.actions";
import { FormField } from "@/components/form-controls";
import { Button } from "@/components/ui/button";

const initialState: AuthActionState = { ok: false };

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <FormField label="Email or username" name="identifier" autoComplete="username" required />
      {state.message ? (
        <p className="rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground">
          {state.message}
          {state.resetToken ? (
            <span className="mt-2 block break-all font-mono text-xs text-foreground">/reset-password?token={state.resetToken}</span>
          ) : null}
        </p>
      ) : null}
      <Button disabled={pending} className="h-11 w-full">
        {pending ? "Preparing reset..." : "Continue"}
      </Button>
      <a href="/login" className="block text-center text-sm font-medium text-primary">
        Back to sign in
      </a>
    </form>
  );
}
