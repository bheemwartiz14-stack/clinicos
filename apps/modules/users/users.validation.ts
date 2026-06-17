import { z } from "zod";

const uuidField = z.string().uuid();
const emailField = z.string().email().max(255).transform((v) => v.toLowerCase());
const passwordField = z.string().min(8, "Password must be at least 8 characters").max(128);
const phoneField = z.string().max(30).regex(/^[+]?[\d\s\-().]{6,30}$/, "Invalid phone number").optional().nullable();

const userStatusEnum = z.enum(["active", "inactive", "blocked"]);

export const createUserSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().max(100).optional().nullable(),
  username: z.string().min(3, "Username must be at least 3 characters").max(100).optional().nullable(),
  roleId: uuidField,
  email: emailField,
  phone: phoneField,
  password: passwordField,
  avatar: z.string().optional().nullable(),
  status: userStatusEnum.default("active"),
  emailVerified: z.boolean().default(false),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().max(100).optional().nullable(),
  username: z.string().min(3).max(100).optional().nullable(),
  roleId: uuidField.optional(),
  email: emailField.optional(),
  phone: phoneField,
  avatar: z.string().optional().nullable(),
  status: userStatusEnum.optional(),
  emailVerified: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  userId: uuidField,
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordField,
});

export const resetPasswordSchema = z.object({
  userId: uuidField,
});

export const updateStatusSchema = z.object({
  userId: uuidField,
  status: userStatusEnum,
});

export const userFilterSchema = z.object({
  roleId: uuidField.optional(),
  status: userStatusEnum.optional(),
  emailVerified: z.coerce.boolean().optional(),
  search: z.string().max(255).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["createdAt", "firstName", "email", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
