import type { DepartmentStatus } from "../validations/department.validation";

export type DepartmentRelationCounts = {
  doctors: number;
  staff: number;
};

export type DepartmentHeadOption = {
  id: string;
  name: string;
  role: string;
  branchId: string;
  branchName: string | null;
};

export type DepartmentRecord = {
  id: string;
  branchId: string;
  branchName: string | null;
  name: string;
  code: string | null;
  description: string | null;
  status: DepartmentStatus;
  headId: string | null;
  headName: string | null;
  updatedAt: string;
  relations: DepartmentRelationCounts;
};
