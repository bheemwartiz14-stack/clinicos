// @ts-nocheck
"use client";

import { useActionState } from "react";
import { generateSlotsAction, type DoctorActionState } from "../actions/doctor.actions";
import { useState } from "react";

interface SlotsGeneratorProps {
  doctorId: string;
  slots: Array<{
    id: string;
    slotDate: string | Date;
    startTime: string;
    endTime: string;
    status: "available" | "booked" | "blocked" | "lunch" | "leave" | "calendar_busy";
  }>;
}

const initialState: DoctorActionState = { ok: false };

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function getStatusBadge(status: string) {
  switch (status) {
    case "available": return "bg-green-100 text-green-700";
    case "booked": return "bg-blue-100 text-blue-700";
    case "blocked": return "bg-slate-100 text-slate-700";
    case "lunch": return "bg-amber-100 text-amber-700";
    case "leave": return "bg-red-100 text-red-700";
    case "calendar_busy": return "bg-violet-100 text-violet-700";
    default: return "bg-slate-100 text-slate-700";
  }
}

export function DoctorSlotsGenerator({ doctorId, slots }: SlotsGeneratorProps) {
  const [state, action, pending] = useActionState(generateSlotsAction, initialState);
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  
  const slotsByDate = slots.reduce((acc, slot) => {
    const dateKey = typeof slot.slotDate === 'string' ? slot.slotDate : slot.slotDate.toISOString().split("T")[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {} as Record<string, typeof slots>);

  const uniqueDates = Object.keys(slotsByDate).sort();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold text-slate-900">Generate Appointment Slots</h3>
        <p className="mt-1 text-sm text-slate-600">Automatically generate available slots based on your schedule.</p>
        
        <form action={action} className="mt-4 flex flex-wrap items-end gap-4">
          <input type="hidden" name="doctorId" value={doctorId} />
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <input type="date" name="startDate" defaultValue={today} min={today} className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <input type="date" name="endDate" defaultValue={nextWeek} min={today} className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary" />
          </div>
          <button type="submit" disabled={pending} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-70">
            {pending ? "Generating..." : "Generate Slots"}
          </button>
        </form>

        {state.message && (
          <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${state.ok ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            {state.message}
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <h3 className="font-semibold text-slate-900">Existing Slots</h3>
        </div>
        {uniqueDates.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No slots generated yet</div>
        ) : (
          <div className="divide-y">
            {uniqueDates.map((date) => (
              <div key={date} className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium text-slate-900">{formatDate(date)}</span>
                  <span className="text-sm text-slate-500">{slotsByDate[date].length} slots</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {slotsByDate[date].map((slot) => (
                    <span key={slot.id} className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(slot.status)}`}>
                      {slot.startTime} - {slot.endTime}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
