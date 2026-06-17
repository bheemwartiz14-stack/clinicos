import { eq } from "drizzle-orm";
import { db, roles } from "@mediclinic/db";
import { hashPassword, verifyPassword } from "@mediclinic/auth";
import { userRepository } from "./users.repository";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserResponse,
  UserRow,
  UserListOptions,
  PaginatedUsersResponse,
  ChangePasswordInput,
  UpdateStatusInput,
  DeleteUserOptions,
} from "./users.types";
import crypto from "crypto";

function toUserResponse(row: {
  id: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  roleId: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: "active" | "inactive" | "blocked";
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  roleName?: string | null;
  roleCode?: string | null;
}): UserResponse {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    username: row.username,
    roleId: row.roleId,
    roleName: row.roleName ?? null,
    roleCode: row.roleCode ?? null,
    email: row.email,
    phone: row.phone,
    avatar: row.avatar,
    status: row.status,
    emailVerified: row.emailVerified,
    lastLoginAt: row.lastLoginAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const userService = {
  async createUser(input: CreateUserInput): Promise<UserResponse> {
    await this.emailExists(input.email);
    if (input.username) {
      await this.usernameExists(input.username);
    }
    await this.roleExists(input.roleId);

    const row = await userRepository.create({
      firstName: input.firstName,
      lastName: input.lastName ?? null,
      username: input.username ?? null,
      roleId: input.roleId,
      email: input.email.toLowerCase(),
      phone: input.phone ?? null,
      passwordHash: await hashPassword(input.password),
      avatar: input.avatar ?? null,
      status: input.status ?? "active",
      emailVerified: input.emailVerified ?? false,
    });
    const roleRow = await db
      .select({ name: roles.name, code: roles.code })
      .from(roles)
      .where(eq(roles.id, row.roleId))
      .limit(1)
      .then((r) => r[0]);

    return toUserResponse({
      ...row,
      roleName: roleRow?.name ?? null,
      roleCode: roleRow?.code ?? null,
    });
  },

  async getUsers(options: UserListOptions): Promise<PaginatedUsersResponse> {
    const { data, total } = await userRepository.findMany(options);

    const roleIds = [...new Set(data.map((u) => u.roleId))];
    const roleRows = roleIds.length > 0
      ? await db
          .select({ id: roles.id, name: roles.name, code: roles.code })
          .from(roles)
      : [];

    const roleMap: Record<string, { name: string; code: string }> = {};
    for (const r of roleRows) {
      roleMap[r.id] = { name: r.name, code: r.code };
    }

    return {
      data: data.map((row) =>
        toUserResponse({
          ...row,
          roleName: roleMap[row.roleId]?.name ?? null,
          roleCode: roleMap[row.roleId]?.code ?? null,
        }),
      ),
      total,
      page: options.page,
      limit: options.limit,
    };
  },

  async getUserById(id: string): Promise<UserResponse | null> {
    const result = await userRepository.findByIdWithRole(id);
    if (!result) return null;

    return toUserResponse({
      ...result.user,
      roleName: result.roleName,
      roleCode: result.roleCode,
    });
  },

  async getUserByEmail(email: string): Promise<UserResponse | null> {
    const row = await userRepository.findByEmail(email);
    if (!row) return null;

    const roleRow = await db
      .select({ name: roles.name, code: roles.code })
      .from(roles)
      .where(eq(roles.id, row.roleId))
      .limit(1)
      .then((r) => r[0]);
    return toUserResponse({
      ...row,
      roleName: roleRow?.name ?? null,
      roleCode: roleRow?.code ?? null,
    });
  },

  async getUserByUsername(username: string): Promise<UserResponse | null> {
    const row = await userRepository.findByUsername(username);
    if (!row) return null;

    const roleRow = await db
      .select({ name: roles.name, code: roles.code })
      .from(roles)
      .where(eq(roles.id, row.roleId))
      .limit(1)
      .then((r) => r[0]);
    return toUserResponse({
      ...row,
      roleName: roleRow?.name ?? null,
      roleCode: roleRow?.code ?? null,
    });
  },

  async updateUser(id: string, input: UpdateUserInput): Promise<UserResponse> {
    const existing = await userRepository.findById(id);
    if (!existing) throw new Error("User not found");

    if (input.email && input.email.toLowerCase() !== existing.email) {
      await this.emailExists(input.email);
    }
    if (input.username && input.username !== existing.username) {
      await this.usernameExists(input.username);
    }
    if (input.roleId) {
      await this.roleExists(input.roleId);
    }

    const updateData: Partial<Omit<UserRow, "id" | "passwordHash" | "createdAt" | "updatedAt">> = {};
    if (input.firstName !== undefined) updateData.firstName = input.firstName;
    if (input.lastName !== undefined) updateData.lastName = input.lastName ?? null;
    if (input.username !== undefined) updateData.username = input.username ?? null;
    if (input.roleId !== undefined) updateData.roleId = input.roleId;
    if (input.email !== undefined) updateData.email = input.email.toLowerCase();
    if (input.phone !== undefined) updateData.phone = input.phone ?? null;
    if (input.avatar !== undefined) updateData.avatar = input.avatar ?? null;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.emailVerified !== undefined) updateData.emailVerified = input.emailVerified;
    const updated = await userRepository.update(id, updateData);
    if (!updated) throw new Error("Failed to update user");
    const roleRow = await db
      .select({ name: roles.name, code: roles.code })
      .from(roles)
      .where(eq(roles.id, updated.roleId))
      .limit(1)
      .then((r) => r[0]);

    return toUserResponse({
      ...updated,
      roleName: roleRow?.name ?? null,
      roleCode: roleRow?.code ?? null,
    });
  },

  async deleteUser(id: string, options: DeleteUserOptions = {}): Promise<void> {
    const existing = await userRepository.findById(id);
    if (!existing) throw new Error("User not found");
    if (options.force) {
      await userRepository.delete(id);
    } else {
      await userRepository.updateStatus(id, "blocked");
    }
  },

  async changePassword(input: ChangePasswordInput): Promise<void> {
    const user = await userRepository.findById(input.userId);
    if (!user) throw new Error("User not found");
    const isValid = await verifyPassword(input.oldPassword, user.passwordHash);
    if (!isValid) throw new Error("Current password is incorrect");
    const newHash = await hashPassword(input.newPassword);
    await userRepository.updatePassword(input.userId, newHash);
  },

  async resetPassword(input: { userId: string }): Promise<string> {
    const user = await userRepository.findById(input.userId);
    if (!user) throw new Error("User not found");
    const tempPassword = crypto.randomBytes(16).toString("hex");
    const hashed = await hashPassword(tempPassword);
    await userRepository.updatePassword(input.userId, hashed);
    return tempPassword;
  },

  async verifyEmail(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    await userRepository.verifyEmail(userId);
  },

  async updateStatus(input: UpdateStatusInput): Promise<void> {
    const user = await userRepository.findById(input.userId);
    if (!user) throw new Error("User not found");

    await userRepository.updateStatus(input.userId, input.status);
  },

  async updateLastLogin(userId: string): Promise<void> {
    await userRepository.updateLastLogin(userId);
  },

  async emailExists(email: string): Promise<void> {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error("A user with this email already exists");
  },

  async usernameExists(username: string): Promise<void> {
    const existing = await userRepository.findByUsername(username);
    if (existing) throw new Error("A user with this username already exists");
  },

  async roleExists(roleId: string): Promise<void> {
    const [role] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    if (!role) throw new Error("Specified role does not exist");
  },
};
