import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppointmentEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="grid min-h-72 place-items-center rounded-lg border border-dashed bg-card p-8 text-center">
      <div>
        <CalendarPlus className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
        <h2 className="mt-4 text-lg font-semibold">No appointments for this date</h2>
        <p className="mt-2 text-sm text-muted-foreground">Create a booking or select an empty calendar slot.</p>
        <Button className="mt-4" onClick={onCreate}>New Booking</Button>
      </div>
    </div>
  );
}
