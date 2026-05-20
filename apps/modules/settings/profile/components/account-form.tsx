"use client";

import { useActionState, useEffect } from "react";
import { Save } from "lucide-react";
import { updateAccountAction, type SettingsActionState } from "../actions/settings.actions";
import type { SettingsProfile } from "../types/settings.types";
import { Field, SelectField } from "./settings-fields";
import { settingsToast } from "./toast-event";

const initialState: SettingsActionState = { ok: false, message: "" };

export function AccountForm({ profile }: { profile: SettingsProfile }) {
  const [state, action, pending] = useActionState(updateAccountAction, initialState);

  useEffect(() => {
    if (!state.message) return;
    settingsToast(state.ok ? "success" : "error", state.message);
  }, [state]);

  return (
    <form action={action} className="rounded-xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-teal-950/5 backdrop-blur">
      <h2 className="text-lg font-semibold text-slate-950">Account Settings</h2>
      <p className="mt-1 text-sm text-slate-500">Manage account identifiers, visibility, and account status.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Username" name="username" defaultValue={profile.username} error={state.fieldErrors?.username?.[0]} />
        <Field label="Email" name="email" type="email" defaultValue={profile.email} error={state.fieldErrors?.email?.[0]} required />
        <SelectField label="Profile visibility" name="profileVisibility" defaultValue={profile.profileVisibility} error={state.fieldErrors?.profileVisibility?.[0]}>
          <option value="private">Private</option>
          <option value="team">Team only</option>
          <option value="clinic">Clinic directory</option>
        </SelectField>
        <Field label="Account status" name="accountStatusDisplay" defaultValue={profile.isActive ? "Active" : "Inactive"} />
      </div>
      <button disabled={pending} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition hover:bg-teal-800 disabled:opacity-60">
        <Save className="h-4 w-4" aria-hidden />
        {pending ? "Saving..." : "Save account settings"}
      </button>
    </form>
  );
}
