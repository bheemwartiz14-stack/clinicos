export function DoctorAvailabilityIndicator({ available }: { available: boolean }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${available ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{available ? "Available" : "Busy"}</span>;
}
