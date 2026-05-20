"use client";

import { useEffect } from "react";

export function ServiceWorkerCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.getRegistrations()
      .then(async (registrations) => {
        const hadController = Boolean(navigator.serviceWorker.controller);
        const hadRegistrations = registrations.length > 0;

        await Promise.all(registrations.map((registration) => registration.unregister()));

        if ((hadController || hadRegistrations) && sessionStorage.getItem("mediclinic-sw-cleaned") !== "true") {
          sessionStorage.setItem("mediclinic-sw-cleaned", "true");
          window.location.replace(window.location.href);
        }
      })
      .catch(() => undefined);

    if ("caches" in window) {
      caches.keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => undefined);
    }
  }, []);

  return null;
}
