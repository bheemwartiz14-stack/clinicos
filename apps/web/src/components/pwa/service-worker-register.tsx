"use client";

import { useEffect } from "react";
import { registerAutoSync } from "@/lib/offline/sync-engine";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      registerAutoSync();
      return;
    }

    if (process.env.NODE_ENV === "development") {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister())),
        );
    } else {
      void navigator.serviceWorker.register("/sw.js");
    }

    registerAutoSync();
  }, []);

  return null;
}
