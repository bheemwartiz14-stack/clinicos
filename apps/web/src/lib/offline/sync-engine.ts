"use client";

import type { OfflineMutation } from "@mediclinicpro/types";
import { offlineDb } from "./db";

type SyncResult = {
  accepted: string[];
  conflicts: Array<{ mutationId: string; serverValue: unknown; localValue: unknown }>;
};

export async function enqueueMutation(mutation: OfflineMutation) {
  await offlineDb.queue.put(mutation);
}

export async function syncOfflineQueue() {
  if (!navigator.onLine) {
    return { accepted: [], conflicts: [] } satisfies SyncResult;
  }

  const mutations = await offlineDb.queue.orderBy("createdAt").limit(100).toArray();
  if (mutations.length === 0) {
    return { accepted: [], conflicts: [] } satisfies SyncResult;
  }

  const response = await fetch("/api/trpc/sync.push", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ json: { mutations } }),
  });

  if (!response.ok) {
    throw new Error("Sync push failed");
  }

  const payload = (await response.json()) as { result?: { data?: { json?: SyncResult } } };
  const result = payload.result?.data?.json ?? { accepted: [], conflicts: [] };

  await offlineDb.transaction("rw", offlineDb.queue, async () => {
    await offlineDb.queue.bulkDelete(result.accepted);
  });

  return result;
}

export function registerAutoSync() {
  window.addEventListener("online", () => {
    void syncOfflineQueue();
  });

  window.setInterval(() => {
    if (navigator.onLine) {
      void syncOfflineQueue();
    }
  }, 30_000);
}
