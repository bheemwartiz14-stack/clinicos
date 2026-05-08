"use client";

import { useEffect } from "react";
import { registerAutoSync } from "@/lib/offline/sync-engine";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }
    registerAutoSync();
  }, []);

  return null;
}
