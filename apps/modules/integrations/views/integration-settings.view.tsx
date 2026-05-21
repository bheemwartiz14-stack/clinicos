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
          <h1 className="text-2xl font-semibold text-foreground">Integrations</h1>
          <p className="mt-1 text-sm text-muted-foreground">Connect Google Calendar and Google Meet for online and offline appointment workflows.</p>
        </div>

        {statusMessage ? (
          <p className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">{statusMessage}</p>
        ) : null}

        <IntegrationTabs state={state} initialTab={initialTab} />
      </main>
    </div>
  );
}
