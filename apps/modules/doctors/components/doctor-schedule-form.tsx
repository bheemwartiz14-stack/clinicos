// @ts-nocheck
"use client";

import { useActionState } from "react";
import { updateScheduleAction, type DoctorActionState } from "../actions/doctor.actions";

interface ScheduleFormProps {
  doctorId: string;
  schedules: Array<{
    dayOfWeek: number;
    isAvailable: boolean;
    startTime: string;
    endTime: string;
  }>;
}

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const initialState: DoctorActionState = { ok: false };

export function DoctorScheduleForm({ doctorId, schedules: initialSchedules }: ScheduleFormProps) {
  const [state, action, pending] = useActionState(updateScheduleAction, initialState);

  const defaultSchedules = [
    { dayOfWeek: 0, isAvailable: false, startTime: "09:00", endTime: "17:00" },
    { dayOfWeek: 1, isAvailable: true, startTime: "09:00", endTime: "17:00" },
    { dayOfWeek: 2, isAvailable: true, startTime: "09:00", endTime: "17:00" },
    { dayOfWeek: 3, isAvailable: true, startTime: "09:00", endTime: "17:00" },
    { dayOfWeek: 4, isAvailable: true, startTime: "09:00", endTime: "17:00" },
    { dayOfWeek: 5, isAvailable: true, startTime: "09:00", endTime: "14:00" },
    { dayOfWeek: 6, isAvailable: false, startTime: "09:00", endTime: "17:00" }
  ];

  const schedules = defaultSchedules.map((day, index) => {
    const existing = initialSchedules.find((s) => s.dayOfWeek === day.dayOfWeek);
    return existing ?? day;
  });

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="doctorId" value={doctorId} />
      
      <div className="rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <h3 className="font-semibold text-slate-900">Weekly Schedule</h3>
          <p className="mt-1 text-sm text-slate-600">Configure working hours for each day of the week.</p>
        </div>
        <div className="divide-y">
          {dayNames.map((dayName, dayIndex) => {
            const schedule = schedules.find((s) => s.dayOfWeek === dayIndex) ?? defaultSchedules[dayIndex];
            return (
              <div key={dayIndex} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" name={`isAvailable_${dayIndex}`} value="true" defaultChecked={schedule.isAvailable} className="peer sr-only" />
                    <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                  </label>
                  <span className={`font-medium ${schedule.isAvailable ? "text-slate-900" : "text-slate-500"}`}>{dayName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="time" name={`startTime_${dayIndex}`} defaultValue={schedule.startTime} disabled={!schedule.isAvailable} className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary disabled:opacity-50" />
                  <span className="text-slate-500">to</span>
                  <input type="time" name={`endTime_${dayIndex}`} defaultValue={schedule.endTime} disabled={!schedule.isAvailable} className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary disabled:opacity-50" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {state.message && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${state.ok ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {state.message}
        </div>
      )}

      <button type="submit" disabled={pending} className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:opacity-70">
        {pending ? "Saving..." : "Save Schedule"}
      </button>
    </form>
  );
}
