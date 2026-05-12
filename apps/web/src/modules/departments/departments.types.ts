export type DepartmentListItem = {
  id: string;
  name: string;
  code: string | null;
  departmentHeadId: string | null;
  departmentHeadName: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type DepartmentStats = {
  totalDepartments: number;
  activeDepartments: number;
  inactiveDepartments: number;
};

export type DepartmentsPageSearchParams = {
  q?: string;
};

export type DepartmentsPageModel = {
  title: string;
  description: string;
  breadcrumb: string[];
  departments: DepartmentListItem[];
  stats: DepartmentStats;
  query: string;
};

export type ActionState = {
  ok: boolean;
  message: string;
};

export type DepartmentInput = {
  name: string;
  code?: string;
  departmentHeadId?: string;
  description?: string;
  isActive: boolean;
};

export type UpdateDepartmentInput = DepartmentInput & {
  id: string;
};
