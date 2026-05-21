// @ts-nocheck
"use client";

import { useActionState } from "react";
import { createLeaveBlockAction, type DoctorActionState } from "../actions/doctor.actions";

interface LeaveFormProps {
  doctorId: string;
}

const initialState: DoctorActionState = { ok: false };

export function DoctorLeaveForm({ doctorId }: LeaveFormProps) {
  const [state, action, pending] = useActionState(createLeaveBlockAction, initialState);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="doctorId" value={doctorId} />
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Leave Type</label>
          <select name="leaveType" required className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
            <option value="full_day">Full Day</option>
            <option value="half_day">Half Day</option>
            <option value="custom_time">Custom Time Range</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">From Date</label>
          <input type="date" name="fromDate" required className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">To Date</label>
          <input type="date" name="toDate" required className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Reason</label>
          <input type="text" name="reason" placeholder="e.g., Vacation, Conference, Sick leave" className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-slate-600">For half day or custom time, specify hours below (optional)</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Time</label>
            <input type="time" name="startTime" className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">End Time</label>
            <input type="time" name="endTime" className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
      </div>

      {state.message && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${state.ok ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {state.message}
        </div>
      )}

      <button type="submit" disabled={pending} className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:opacity-70">
        {pending ? "Submitting..." : "Request Leave"}
      </button>
    </form>
  );
}
