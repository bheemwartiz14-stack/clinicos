import type {
  DepartmentOption,
  RoleOption,
  UserListItem,
  UsersPageModel,
  UsersPagination,
  UsersStats,
} from "./users.types";

type UsersPageModelInput = {
  users: UserListItem[];
  roles: RoleOption[];
  departments: DepartmentOption[];
  query?: string;
  stats: UsersStats;
  pagination: UsersPagination;
};

export function getUsersPageModel({
  pagination,
  query = "",
  departments,
  roles,
  stats,
  users,
}: UsersPageModelInput): UsersPageModel {
  return {
    title: "User Management",
    description: "Create users, maintain profile details, and assign role-based access.",
    breadcrumb: ["Workspace", "Settings", "User Management"],
    users,
    roles,
    departments,
    query,
    stats,
    pagination,
  };
}
