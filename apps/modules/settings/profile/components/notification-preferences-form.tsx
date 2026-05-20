"use client";

import { useActionState, useEffect } from "react";
import { BellRing, Save } from "lucide-react";
import { updateNotificationPreferencesAction, type SettingsActionState } from "../actions/settings.actions";
import { Field, Toggle } from "./settings-fields";
import { settingsToast } from "./toast-event";

const initialState: SettingsActionState = { ok: false, message: "" };

type Preferences = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  appointmentAlerts: boolean;
  billingAlerts: boolean;
  systemAlerts: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
};

export function NotificationPreferencesForm({ preferences }: { preferences: Preferences }) {
  const [state, action, pending] = useActionState(updateNotificationPreferencesAction, initialState);

  useEffect(() => {
    if (!state.message) return;
    settingsToast(state.ok ? "success" : "error", state.message);
  }, [state]);

  return (
    <form action={action} className="rounded-xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-teal-950/5 backdrop-blur">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-teal-50 text-teal-700">
          <BellRing className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Notification Preferences</h2>
          <p className="mt-1 text-sm text-slate-500">Choose the channels and events that should reach you.</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Toggle label="Email notifications" description="Receive operational messages by email." name="emailNotifications" defaultChecked={preferences.emailNotifications} />
        <Toggle label="SMS notifications" description="Send urgent clinic updates by SMS." name="smsNotifications" defaultChecked={preferences.smsNotifications} />
        <Toggle label="WhatsApp notifications" description="Receive mobile workflow messages." name="whatsappNotifications" defaultChecked={preferences.whatsappNotifications} />
        <Toggle label="Appointment alerts" description="Check-ins, schedule changes, and reminders." name="appointmentAlerts" defaultChecked={preferences.appointmentAlerts} />
        <Toggle label="Billing alerts" description="Invoice, payment, and refund activity." name="billingAlerts" defaultChecked={preferences.billingAlerts} />
        <Toggle label="System alerts" description="Security, compliance, and system notices." name="systemAlerts" defaultChecked={preferences.systemAlerts} />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Quiet hours start" name="quietHoursStart" type="time" defaultValue={preferences.quietHoursStart} />
        <Field label="Quiet hours end" name="quietHoursEnd" type="time" defaultValue={preferences.quietHoursEnd} />
      </div>
      <button disabled={pending} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition hover:bg-teal-800 disabled:opacity-60">
        <Save className="h-4 w-4" aria-hidden />
        {pending ? "Saving..." : "Save preferences"}
      </button>
    </form>
  );
}
