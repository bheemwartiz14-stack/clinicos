import type { StaffRecord } from "../types/staff.types";

export type SerializableStaffInput = Omit<StaffRecord, "updatedAt" | "lastLoginAt"> & {
  updatedAt: Date;
  lastLoginAt: Date | null;
};

export function serializeStaff(staff: SerializableStaffInput): StaffRecord {
  return {
    ...staff,
    updatedAt: staff.updatedAt.toISOString(),
    lastLoginAt: staff.lastLoginAt?.toISOString() ?? null
  };
}
