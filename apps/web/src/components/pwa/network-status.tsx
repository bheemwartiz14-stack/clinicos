"use client";

import { Badge } from "@mediclinicpro/ui/components/badge";
import { Wifi, WifiOff } from "lucide-react";
import { useEffect } from "react";
import { useNetworkStore } from "@/lib/store/network-store";

export function NetworkStatus() {
  const online = useNetworkStore((state) => state.online);
  const setOnline = useNetworkStore((state) => state.setOnline);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    sync();
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, [setOnline]);

  return (
    <Badge className={online ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}>
      {online ? <Wifi size={14} /> : <WifiOff size={14} />}
      {online ? "Online" : "Offline"}
    </Badge>
  );
}
