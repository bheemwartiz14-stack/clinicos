import type { StaffRole } from "../validations/staff.validation";

export type StaffRecord = {
  id: string;
  branchId: string;
  branchName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  role: StaffRole;
  name: string;
  email: string;
  username: string | null;
  phone: string | null;
  isActive: boolean;
  shiftStart: string | null;
  shiftEnd: string | null;
  lastLoginAt: string | null;
  updatedAt: string;
};
