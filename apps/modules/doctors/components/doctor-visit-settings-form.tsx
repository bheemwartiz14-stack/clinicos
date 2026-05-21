// @ts-nocheck
"use client";

import { useActionState } from "react";
import { updateVisitSettingsAction, type DoctorActionState } from "../actions/doctor.actions";

interface VisitSettingsFormProps {
  doctorId: string;
  settings: {
    visitDurationMinutes: number;
    bufferTimeMinutes: number;
    maxPatientsPerDay: number;
    autoGenerateSlots: boolean;
    allowOnlineConsultation: boolean;
  };
}

const visitDurationOptions = [15, 20, 30, 45, 60];
const bufferTimeOptions = [0, 5, 10, 15];

const initialState: DoctorActionState = { ok: false };

export function DoctorVisitSettingsForm({ doctorId, settings }: VisitSettingsFormProps) {
  const [state, action, pending] = useActionState(updateVisitSettingsAction, initialState);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="doctorId" value={doctorId} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Visit Duration</label>
          <select name="visitDurationMinutes" defaultValue={settings.visitDurationMinutes} className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
            {visitDurationOptions.map((minutes) => (
              <option key={minutes} value={minutes}>{minutes} minutes</option>
            ))}
          </select>
          <p className="text-xs text-slate-500">Time allocated for each patient consultation</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Buffer Time</label>
          <select name="bufferTimeMinutes" defaultValue={settings.bufferTimeMinutes} className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
            {bufferTimeOptions.map((minutes) => (
              <option key={minutes} value={minutes}>{minutes} minutes</option>
            ))}
          </select>
          <p className="text-xs text-slate-500">Time between appointments for preparation</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Max Patients Per Day</label>
          <input type="number" name="maxPatientsPerDay" defaultValue={settings.maxPatientsPerDay} min={1} max={50} className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          <p className="text-xs text-slate-500">Maximum number of appointments per day</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-3 rounded-xl border border-white/70 bg-white/70 p-4 cursor-pointer shadow-sm">
          <input type="checkbox" name="autoGenerateSlots" value="true" defaultChecked={settings.autoGenerateSlots} className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary" />
          <div>
            <span className="font-medium text-slate-900">Auto-generate appointment slots</span>
            <p className="text-sm text-slate-600">Automatically create available slots based on your schedule</p>
          </div>
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-white/70 bg-white/70 p-4 cursor-pointer shadow-sm">
          <input type="checkbox" name="allowOnlineConsultation" value="true" defaultChecked={settings.allowOnlineConsultation} className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary" />
          <div>
            <span className="font-medium text-slate-900">Allow online consultations</span>
            <p className="text-sm text-slate-600">Enable virtual appointments for remote patients</p>
          </div>
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4 cursor-pointer">
          <input type="checkbox" name="regenerateSlots" value="true" defaultChecked={true} className="h-5 w-5 rounded border-teal-300 text-teal-600 focus:ring-teal-500" />
          <div>
            <span className="font-medium text-teal-900">Regenerate slots after saving</span>
            <p className="text-sm text-teal-700">Automatically update appointment slots based on new settings</p>
          </div>
        </label>
      </div>

      {state.message && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${state.ok ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {state.message}
        </div>
      )}

      <button type="submit" disabled={pending} className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:opacity-70">
        {pending ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
