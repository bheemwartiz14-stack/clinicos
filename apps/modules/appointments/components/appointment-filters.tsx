"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AppointmentFilters({ selectedDate }: { selectedDate: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        type="date"
        value={selectedDate}
        onChange={(event) => router.push(`/appointments?date=${event.target.value}`)}
        className="w-full sm:w-44"
      />
      <Button variant="outline" onClick={() => router.push("/appointments")}>Today</Button>
    </div>
  );
}
