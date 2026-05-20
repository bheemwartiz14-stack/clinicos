"use client";

import { useActionState } from "react";
import { updateBreaksAction, type DoctorActionState } from "../actions/doctor.actions";

interface BreaksFormProps {
  doctorId: string;
  breaks: Array<{
    id?: string;
    breakType: string;
    breakName: string | null;
    startTime: string;
    endTime: string;
    isEnabled: boolean;
  }>;
}

const initialState: DoctorActionState = { ok: false };

export function DoctorBreaksForm({ doctorId, breaks: initialBreaks }: BreaksFormProps) {
  const [state, action, pending] = useActionState(updateBreaksAction, initialState);

  const lunchBreak = initialBreaks.find((b) => b.breakType === "lunch") ?? { breakType: "lunch", startTime: "12:00", endTime: "13:00", isEnabled: false };
  const shortBreak = initialBreaks.find((b) => b.breakType === "break") ?? { breakType: "break", startTime: "15:00", endTime: "15:30", isEnabled: false };

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="doctorId" value={doctorId} />
      
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Lunch Break</h3>
              <p className="mt-1 text-sm text-slate-600">Daily lunch break time (typically 12:00 - 13:00)</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" name="breakEnabled_lunch" value="true" defaultChecked={lunchBreak.isEnabled} className="peer sr-only" />
              <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>
          {lunchBreak.isEnabled && (
            <div className="mt-4 flex items-center gap-2">
              <input type="time" name="breakStart_lunch" defaultValue={lunchBreak.startTime} className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary" />
              <span className="text-slate-500">to</span>
              <input type="time" name="breakEnd_lunch" defaultValue={lunchBreak.endTime} className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Short Break</h3>
              <p className="mt-1 text-sm text-slate-600">Additional break time (e.g., afternoon break)</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" name="breakEnabled_break" value="true" defaultChecked={shortBreak.isEnabled} className="peer sr-only" />
              <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>
          {shortBreak.isEnabled && (
            <div className="mt-4 flex items-center gap-2">
              <input type="time" name="breakStart_break" defaultValue={shortBreak.startTime} className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary" />
              <span className="text-slate-500">to</span>
              <input type="time" name="breakEnd_break" defaultValue={shortBreak.endTime} className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary" />
            </div>
          )}
        </div>
      </div>

      {state.message && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${state.ok ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {state.message}
        </div>
      )}

      <button type="submit" disabled={pending} className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:opacity-70">
        {pending ? "Saving..." : "Save Breaks"}
      </button>
    </form>
  );
}