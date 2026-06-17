import type { InferSelectModel } from "drizzle-orm";
import { users, roles } from "@mediclinic/db";

export type UserRow = InferSelectModel<typeof users>;
export type RoleRow = InferSelectModel<typeof roles>;

export type UserStatus = "active" | "inactive" | "blocked";

export interface CreateUserInput {
  firstName: string;
  lastName?: string | null;
  username?: string | null;
  roleId: string;
  email: string;
  phone?: string | null;
  password: string;
  avatar?: string | null;
  status?: UserStatus;
  emailVerified?: boolean;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string | null;
  username?: string | null;
  roleId?: string;
  email?: string;
  phone?: string | null;
  avatar?: string | null;
  status?: UserStatus;
  emailVerified?: boolean;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  roleId: string;
  roleName: string | null;
  roleCode: string | null;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFilters {
  roleId?: string;
  status?: UserStatus;
  emailVerified?: boolean;
  search?: string;
}

export interface UserListOptions {
  page: number;
  limit: number;
  filters?: UserFilters;
  sortBy?: "createdAt" | "firstName" | "email" | "status";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedUsersResponse {
  data: UserResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface ChangePasswordInput {
  userId: string;
  oldPassword: string;
  newPassword: string;
}

export interface ResetPasswordInput {
  userId: string;
}

export interface UpdateStatusInput {
  userId: string;
  status: UserStatus;
}

export interface DeleteUserOptions {
  force?: boolean;
}
