import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { DoctorConsultationSettings } from "../types/doctor.types";

export function DoctorConsultationSettingsFields({ settings }: { settings?: DoctorConsultationSettings | null }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="grid gap-2">
        <Label>Consultation fee</Label>
        <Input name="consultationFee" type="number" min={0} step="0.01" defaultValue={settings?.consultationFee ?? "0"} required />
      </label>
      <label className="grid gap-2">
        <Label>Follow-up fee</Label>
        <Input name="followUpFee" type="number" min={0} step="0.01" defaultValue={settings?.followUpFee ?? "0"} />
      </label>
      <label className="grid gap-2">
        <Label>Follow-up validity days</Label>
        <Input name="followUpValidityDays" type="number" min={0} max={365} defaultValue={settings?.followUpValidityDays ?? 7} />
      </label>
      <label className="grid gap-2">
        <Label>Default slot duration</Label>
        <Input name="defaultSlotDuration" type="number" min={5} max={240} defaultValue={settings?.defaultSlotDuration ?? 20} required />
      </label>
      <label className="grid gap-2">
        <Label>Online consultation fee</Label>
        <Input name="onlineConsultationFee" type="number" min={0} step="0.01" defaultValue={settings?.onlineConsultationFee ?? settings?.consultationFee ?? "0"} />
      </label>
      <div className="flex items-center justify-between rounded-lg border p-3">
        <Label htmlFor="allowOnlineConsultation">Allow online consultation</Label>
        <Switch id="allowOnlineConsultation" name="allowOnlineConsultation" value="true" defaultChecked={settings?.allowOnlineConsultation ?? false} />
      </div>
      <label className="grid gap-2 md:col-span-2">
        <Label>Consultation notes</Label>
        <Textarea name="notes" defaultValue={settings?.notes ?? ""} rows={4} />
      </label>
    </div>
  );
}
