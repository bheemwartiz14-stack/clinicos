export type RoleOption = {
  id: string;
  name: string;
  label: string;
};

export type DepartmentOption = {
  id: string;
  name: string;
  code: string | null;
};

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  roleId: string | null;
  roleName: string | null;
  isProtectedSuperAdmin: boolean;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  specialization: string | null;
  qualification: string | null;
  experienceYears: number | null;
  consultationFee: string | null;
  licenseNumber: string | null;
  department: string | null;
  bio: string | null;
  employeeCode: string | null;
  shift: string | null;
  deskNumber: string | null;
  joiningDate: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UsersStats = {
  totalUsers: number;
  verifiedUsers: number;
  withRoles: number;
};

export type UsersPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type UsersPageSearchParams = {
  q?: string;
  page?: string;
  pageSize?: string;
};

export type UsersPageModel = {
  title: string;
  description: string;
  breadcrumb: string[];
  users: UserListItem[];
  roles: RoleOption[];
  departments: DepartmentOption[];
  query: string;
  stats: UsersStats;
  pagination: UsersPagination;
};

export type ActionState = {
  ok: boolean;
  message: string;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  emailVerified: boolean;
  image?: string;
  roleId?: string;
  roleName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  avatarUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  specialization?: string;
  qualification?: string;
  experienceYears?: number;
  consultationFee?: string;
  licenseNumber?: string;
  department?: string;
  bio?: string;
  employeeCode?: string;
  shift?: string;
  deskNumber?: string;
  joiningDate?: string;
};

export type UpdateUserInput = Omit<CreateUserInput, "password"> & {
  id: string;
  password?: string;
};
