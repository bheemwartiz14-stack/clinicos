import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { ActionState, GeneralSettingsPageModel } from "../genral-setting.types";
import { GeneralSettingsForm, GeneralSettingsToast } from "./genral-setting.form";

type GeneralSettingsAction = (formData: FormData) => Promise<ActionState>;

type GeneralSettingsViewProps = GeneralSettingsPageModel & {
  updateAction: GeneralSettingsAction;
};

export function GeneralSettingsView({
  breadcrumb,
  description,
  settings,
  title,
  updateAction,
}: GeneralSettingsViewProps) {
  return (
    <DashboardShell activeHref="/setting/system/settings" breadcrumb={breadcrumb} title={title}>
      <GeneralSettingsToast />
      <div className="space-y-5">
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        <GeneralSettingsForm action={updateAction} settings={settings} />
      </div>
    </DashboardShell>
  );
}
