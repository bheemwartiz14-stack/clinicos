"use client";

import { useActionState } from "react";
import { resetPasswordAction, type AuthActionState } from "../actions/auth.actions";
import { FormField } from "@/components/form-controls";
import { Button } from "@/components/ui/button";

const initialState: AuthActionState = { ok: false };

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <FormField label="New password" name="password" type="password" autoComplete="new-password" minLength={8} required />
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
      <Button disabled={pending} className="h-11 w-full">
        {pending ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  );
}
