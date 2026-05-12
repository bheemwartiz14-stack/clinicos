import type {
  DepartmentListItem,
  DepartmentStats,
  DepartmentsPageModel,
} from "./departments.types";

type DepartmentsPageModelInput = {
  departments: DepartmentListItem[];
  query?: string;
  stats: DepartmentStats;
};

export function getDepartmentsPageModel({
  departments,
  query = "",
  stats,
}: DepartmentsPageModelInput): DepartmentsPageModel {
  return {
    title: "Departments",
    description: "Manage clinic departments used for doctors and operational reporting.",
    breadcrumb: ["Workspace", "Doctors", "Departments"],
    departments,
    stats,
    query,
  };
}
