"use client";

import type { OfflineMutation } from "@mediclinicpro/types";
import Dexie, { type Table } from "dexie";

export interface LocalPatient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  version: number;
  updatedAt: string;
  dirty?: boolean;
}

export class ClinicOfflineDb extends Dexie {
  patients!: Table<LocalPatient, string>;
  queue!: Table<OfflineMutation, string>;
  metadata!: Table<{ key: string; value: string }, string>;

  constructor() {
    super("mediclinicpro-offline");
    this.version(1).stores({
      patients: "id, phone, updatedAt, dirty",
      queue: "id, entity, operation, createdAt",
      metadata: "key",
    });
  }
}

export const offlineDb = new ClinicOfflineDb();
