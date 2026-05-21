"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, KeyRound, Save } from "lucide-react";
import { changePasswordAction, type SettingsActionState } from "../actions/settings.actions";
import { settingsToast } from "./toast-event";

const initialState: SettingsActionState = { ok: false, message: "" };

function score(password: string) {
  return [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initialState);
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState("");
  const strength = useMemo(() => score(password), [password]);

  useEffect(() => {
    if (!state.message) return;
    settingsToast(state.ok ? "success" : "error", state.message);
  }, [state]);

  const type = visible ? "text" : "password";
  const inputClass = "h-11 rounded-lg border border-border bg-background px-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <form action={action} className="rounded-xl border border-border bg-card/80 p-5 shadow-lg shadow-foreground/5 backdrop-blur">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
          <p className="mt-1 text-sm text-muted-foreground">A strong password protects patient and clinic data.</p>
        </div>
        <button type="button" onClick={() => setVisible((value) => !value)} className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition hover:text-foreground">
          {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          <span className="sr-only">Toggle password visibility</span>
        </button>
      </div>
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm">
          <span className="font-semibold text-foreground">Current password</span>
          <input name="currentPassword" type={type} className={inputClass} />
          {state.fieldErrors?.currentPassword?.[0] ? <span className="text-xs font-medium text-rose-600">{state.fieldErrors.currentPassword[0]}</span> : null}
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-semibold text-foreground">New password</span>
          <input name="newPassword" type={type} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
          <span className="grid h-2 grid-cols-5 gap-1">
            {[1, 2, 3, 4, 5].map((item) => (
              <span key={item} className={item <= strength ? "rounded-full bg-primary" : "rounded-full bg-muted"} />
            ))}
          </span>
          {state.fieldErrors?.newPassword?.[0] ? <span className="text-xs font-medium text-rose-600">{state.fieldErrors.newPassword[0]}</span> : null}
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-semibold text-foreground">Confirm password</span>
          <input name="confirmPassword" type={type} className={inputClass} />
          {state.fieldErrors?.confirmPassword?.[0] ? <span className="text-xs font-medium text-rose-600">{state.fieldErrors.confirmPassword[0]}</span> : null}
        </label>
        <label className="flex items-center gap-3 rounded-lg border border-border bg-background/70 p-4 text-sm font-medium text-foreground">
          <input name="logoutOtherDevices" type="checkbox" defaultChecked className="h-5 w-5 accent-primary" />
          Logout from all other devices after password change
        </label>
        <div className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Security tips</p>
          <p className="mt-1">Use a unique password with uppercase, lowercase, number, and special character requirements.</p>
        </div>
        <button disabled={pending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">
          {pending ? <KeyRound className="h-4 w-4 animate-pulse" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
          {pending ? "Updating..." : "Update password"}
        </button>
      </div>
    </form>
  );
}
