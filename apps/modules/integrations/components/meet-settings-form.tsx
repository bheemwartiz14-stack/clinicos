"use client";

import { useForm } from "react-hook-form";
import { CheckboxField } from "@/components/form-controls";

export function MeetSettingsForm({ metadata, disabled }: { metadata?: Record<string, unknown> | null; disabled?: boolean }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      defaultOnlineConsultation: metadata?.defaultOnlineConsultation === true,
      autoCreateMeetLink: metadata?.autoCreateMeetLink !== false
    }
  });

  const values = watch();

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Google Meet Settings</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-4">
            <CheckboxField
              label="Default online consultation"
              {...register("defaultOnlineConsultation")}
              disabled={disabled}
            />
            <p className="mt-2 text-xs text-muted-foreground">New online appointments will use Google Meet by default.</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <CheckboxField
              label="Auto-create Meet link"
              {...register("autoCreateMeetLink")}
              disabled={disabled}
            />
            <p className="mt-2 text-xs text-muted-foreground">Automatically generate Google Meet links for online appointments.</p>
          </div>
        </div>
      </div>
    </div>
  );
}