"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Video } from "lucide-react";
import { GoogleCalendarTabView } from "../views/google-calendar-tab.view";
import { GoogleMeetTabView } from "../views/google-meet-tab.view";
import type { IntegrationSettingsState } from "../types/integration.types";

export function IntegrationTabs({ state, initialTab }: { state: IntegrationSettingsState; initialTab?: string | null }) {
  const normalizedInitialTab = initialTab === "google_meet" ? "google_meet" : "google_calendar";
  const [tab, setTab] = useState<"google_calendar" | "google_meet">(normalizedInitialTab);
  const tabs = useMemo(() => [
    { id: "google_calendar" as const, label: "Google Calendar", icon: CalendarDays },
    { id: "google_meet" as const, label: "Google Meet", icon: Video }
  ], []);

  return (
    <div className="rounded-2xl border border-border bg-card/80 p-3 shadow-lg shadow-foreground/5 backdrop-blur">
      <div className="grid gap-2 rounded-xl bg-muted p-1 md:inline-grid md:grid-cols-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${
              tab === item.id ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" aria-hidden />
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "google_calendar" ? (
          <GoogleCalendarTabView integration={state.googleCalendar} busyEventsCount={state.busyEventsCount} canManage={state.canManage} />
        ) : (
          <GoogleMeetTabView integration={state.googleMeet} canManage={state.canManage} />
        )}
      </div>
    </div>
  );
}
