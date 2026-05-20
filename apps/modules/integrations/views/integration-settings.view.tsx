import { SettingsSidebar } from "@modules/settings/profile/components/settings-sidebar";
import type { Role } from "@mediclinic/rbac";
import { IntegrationTabs } from "../components/integration-tabs";
import type { IntegrationSettingsState } from "../types/integration.types";

export function IntegrationSettingsView({ role, state, initialTab, statusMessage }: {
  role: Role;
  state: IntegrationSettingsState;
  initialTab?: string | null;
  statusMessage?: string | null;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <SettingsSidebar role={role} />
      <main className="min-w-0 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Integrations</h1>
          <p className="mt-1 text-sm text-slate-600">Connect Google Calendar and Google Meet for online and offline appointment workflows.</p>
        </div>

        {statusMessage ? (
          <p className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800">{statusMessage}</p>
        ) : null}

        <IntegrationTabs state={state} initialTab={initialTab} />
      </main>
    </div>
  );
}
