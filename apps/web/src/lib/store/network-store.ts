"use client";

import { create } from "zustand";

type NetworkState = {
  online: boolean;
  setOnline: (online: boolean) => void;
};

export const useNetworkStore = create<NetworkState>((set) => ({
  online: typeof navigator === "undefined" ? true : navigator.onLine,
  setOnline: (online) => set({ online }),
}));
