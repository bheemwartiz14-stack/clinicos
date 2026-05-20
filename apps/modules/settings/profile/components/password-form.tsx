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

  return (
    <form action={action} className="rounded-xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-teal-950/5 backdrop-blur">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Change Password</h2>
          <p className="mt-1 text-sm text-slate-500">A strong password protects patient and clinic data.</p>
        </div>
        <button type="button" onClick={() => setVisible((value) => !value)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600">
          {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          <span className="sr-only">Toggle password visibility</span>
        </button>
      </div>
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm">
          <span className="font-semibold text-slate-800">Current password</span>
          <input name="currentPassword" type={type} className="h-11 rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
          {state.fieldErrors?.currentPassword?.[0] ? <span className="text-xs font-medium text-rose-600">{state.fieldErrors.currentPassword[0]}</span> : null}
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-semibold text-slate-800">New password</span>
          <input name="newPassword" type={type} onChange={(event) => setPassword(event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
          <span className="grid h-2 grid-cols-5 gap-1">
            {[1, 2, 3, 4, 5].map((item) => (
              <span key={item} className={item <= strength ? "rounded-full bg-teal-600" : "rounded-full bg-slate-200"} />
            ))}
          </span>
          {state.fieldErrors?.newPassword?.[0] ? <span className="text-xs font-medium text-rose-600">{state.fieldErrors.newPassword[0]}</span> : null}
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-semibold text-slate-800">Confirm password</span>
          <input name="confirmPassword" type={type} className="h-11 rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
          {state.fieldErrors?.confirmPassword?.[0] ? <span className="text-xs font-medium text-rose-600">{state.fieldErrors.confirmPassword[0]}</span> : null}
        </label>
        <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white/80 p-4 text-sm font-medium text-slate-700">
          <input name="logoutOtherDevices" type="checkbox" defaultChecked className="h-5 w-5 accent-teal-600" />
          Logout from all other devices after password change
        </label>
        <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Security tips</p>
          <p className="mt-1">Use a unique password with uppercase, lowercase, number, and special character requirements.</p>
        </div>
        <button disabled={pending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
          {pending ? <KeyRound className="h-4 w-4 animate-pulse" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
          {pending ? "Updating..." : "Update password"}
        </button>
      </div>
    </form>
  );
}
