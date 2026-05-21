import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { doctorDaysOfWeek } from "../schemas/doctor.schema";
import type { DoctorSchedule } from "../types/doctor.types";

function title(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function DoctorScheduleFields({ schedules, defaultSlotDuration = 20 }: { schedules?: DoctorSchedule[]; defaultSlotDuration?: number }) {
  return (
    <div className="grid gap-3">
      {doctorDaysOfWeek.map((day) => {
        const schedule = schedules?.find((item) => item.dayOfWeek === day);
        const enabled = schedule?.isActive ?? ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(day);
        return (
          <div key={day} className="grid gap-3 rounded-lg border p-3 md:grid-cols-[130px_1fr_1fr_1fr] md:items-center">
            <div className="flex items-center gap-3">
              <Switch name={`schedule.${day}.isActive`} defaultChecked={enabled} value="true" />
              <Label className="font-semibold">{title(day)}</Label>
            </div>
            <Input name={`schedule.${day}.startTime`} type="time" defaultValue={schedule?.startTime ?? "09:00"} aria-label={`${day} start time`} />
            <Input name={`schedule.${day}.endTime`} type="time" defaultValue={schedule?.endTime ?? "17:00"} aria-label={`${day} end time`} />
            <Input name={`schedule.${day}.slotDuration`} type="number" min={5} max={240} defaultValue={schedule?.slotDuration ?? defaultSlotDuration} aria-label={`${day} slot duration`} />
          </div>
        );
      })}
    </div>
  );
}
