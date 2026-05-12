import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { getClientIp } from "@/hooks/common";
import { getCurrentUser } from "@/modules/auth/auth.service";
import { hasAnyPermission } from "@/modules/auth/permissions";
import { createActivityLog } from "@/modules/setting/audit-logs/hooks/audit-logs.logger";
import { getUsersPageModel } from "./users.model";
import {
  countUsers,
  countUsersWithRoles,
  countVerifiedUsers,
  createUser,
  deleteUser,
  findDepartmentOptions,
  findRoleOptions,
  findUserProtection,
  findUsers,
  updateUser,
} from "./users.repository";
import type { ActionState, UsersPageSearchParams } from "./users.types";
import { createUserSchema, updateUserSchema } from "./users.validation";

const USERS_PATH = "/setting/users";
const DEFAULT_PAGE_SIZE = 10;
const USER_UPLOAD_DIR = "uploads/users";
const MAX_USER_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_USER_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const ALLOWED_USER_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

class UserImageUploadError extends Error {}

async function requireUsersPermission() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && !hasAnyPermission(user.permissions, ["users.manage", "settings.manage"])) {
    redirect("/dashboard");
  }

  return user;
}

function emptyToUndefined(value: FormDataEntryValue | null) {
  const stringValue = String(value ?? "").trim();
  return stringValue.length > 0 ? stringValue : undefined;
}

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function getUploadedFile(formData: FormData, name: string) {
  const value = formData.get(name);

  if (!(value instanceof File) || value.size === 0) {
    return undefined;
  }

  return value;
}

function sanitizeFilename(filename: string) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function saveUserImage(file: File) {
  if (file.size > MAX_USER_IMAGE_SIZE_BYTES) {
    throw new UserImageUploadError("User image must be 2 MB or smaller.");
  }

  const extension = path.extname(file.name).toLowerCase();

  if (!ALLOWED_USER_IMAGE_TYPES.has(file.type) && !ALLOWED_USER_IMAGE_EXTENSIONS.has(extension)) {
    throw new UserImageUploadError("User image must be JPG, PNG, WebP, or GIF.");
  }

  const uploadDir = path.join(process.cwd(), "public", USER_UPLOAD_DIR);
  await mkdir(uploadDir, { recursive: true });

  const safeName = sanitizeFilename(file.name) || `user-image${extension || ".png"}`;
  const filename = `user-${randomUUID()}-${safeName}`;
  const diskPath = path.join(uploadDir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(diskPath, bytes);

  return `/${USER_UPLOAD_DIR}/${filename}`;
}

async function parseUserForm(formData: FormData) {
  const imageFile = getUploadedFile(formData, "imageFile");
  const avatarFile = getUploadedFile(formData, "avatarFile");

  return {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    emailVerified: parseBoolean(formData.get("emailVerified")),
    image: imageFile ? await saveUserImage(imageFile) : emptyToUndefined(formData.get("image")),
    roleId: emptyToUndefined(formData.get("roleId")),
    roleName: emptyToUndefined(formData.get("roleName")),
    firstName: emptyToUndefined(formData.get("firstName")),
    lastName: emptyToUndefined(formData.get("lastName")),
    phone: emptyToUndefined(formData.get("phone")),
    gender: emptyToUndefined(formData.get("gender")),
    dateOfBirth: emptyToUndefined(formData.get("dateOfBirth")),
    avatarUrl: avatarFile
      ? await saveUserImage(avatarFile)
      : emptyToUndefined(formData.get("avatarUrl")),
    address: emptyToUndefined(formData.get("address")),
    city: emptyToUndefined(formData.get("city")),
    state: emptyToUndefined(formData.get("state")),
    country: emptyToUndefined(formData.get("country")),
    postalCode: emptyToUndefined(formData.get("postalCode")),
    specialization: emptyToUndefined(formData.get("specialization")),
    qualification: emptyToUndefined(formData.get("qualification")),
    experienceYears: emptyToUndefined(formData.get("experienceYears")),
    consultationFee: emptyToUndefined(formData.get("consultationFee")),
    licenseNumber: emptyToUndefined(formData.get("licenseNumber")),
    department: emptyToUndefined(formData.get("department")),
    bio: emptyToUndefined(formData.get("bio")),
    employeeCode: emptyToUndefined(formData.get("employeeCode")),
    shift: emptyToUndefined(formData.get("shift")),
    deskNumber: emptyToUndefined(formData.get("deskNumber")),
    joiningDate: emptyToUndefined(formData.get("joiningDate")),
  };
}

async function parseUpdateUserForm(formData: FormData) {
  return {
    id: String(formData.get("id") ?? "").trim(),
    ...(await parseUserForm(formData)),
  };
}

function getUserDisplayName(user: { name?: string | null; email?: string | null }) {
  return user.name ?? user.email ?? "Unknown user";
}

function getActionError(error: unknown, fallback: string): ActionState {
  if (error instanceof ZodError) {
    return {
      ok: false,
      message: error.issues[0]?.message ?? "Please check the user details and try again.",
    };
  }

  if (error instanceof UserImageUploadError) {
    return {
      ok: false,
      message: error.message,
    };
  }

  if (
    error instanceof Error &&
    (error.message.includes("duplicate key") || error.message.includes("unique"))
  ) {
    return {
      ok: false,
      message: "A user with this email already exists.",
    };
  }

  console.error("User management action error:", error);

  return { ok: false, message: fallback };
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function getUsersPageData(searchParams: Promise<UsersPageSearchParams>) {
  await requireUsersPermission();

  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const page = parsePositiveInt(params.page, 1);
  const pageSize = Math.min(parsePositiveInt(params.pageSize, DEFAULT_PAGE_SIZE), 50);

  const [users, roles, departments, totalUsers, verifiedUsers, withRoles] = await Promise.all([
    findUsers({ page, pageSize, query }),
    findRoleOptions(),
    findDepartmentOptions(),
    countUsers(query),
    countVerifiedUsers(),
    countUsersWithRoles(),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageUsers =
    safePage === page ? users : await findUsers({ page: safePage, pageSize, query });

  return getUsersPageModel({
    users: pageUsers,
    roles,
    departments,
    query,
    stats: {
      totalUsers,
      verifiedUsers,
      withRoles,
    },
    pagination: {
      page: safePage,
      pageSize,
      totalItems: totalUsers,
      totalPages,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages,
    },
  });
}

export async function createUserFromForm(formData: FormData): Promise<ActionState> {
  const currentUser = await requireUsersPermission();
  try {
    const input = createUserSchema.parse(await parseUserForm(formData));
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await createUser(input, passwordHash);
    if (!user) {
      return { ok: false, message: "Unable to create user." };
    }
    const ipAddress = await getClientIp();
    await createActivityLog({
      action: "CREATE_USER",
      module: "users",
      description: `Created user ${user.email}`,
      userId: currentUser.id,
      userName: getUserDisplayName(currentUser),
      ipAddress,
      metadata: {
        userId: user.id,
        email: user.email,
      },
    });

    revalidatePath(USERS_PATH, "page");
    return { ok: true, message: "User created successfully." };
  } catch (error) {
    return getActionError(error, "Unable to create user. Please try again.");
  }
}

export async function updateUserFromForm(formData: FormData): Promise<ActionState> {
  const currentUser = await requireUsersPermission();

  try {
    const input = updateUserSchema.parse(await parseUpdateUserForm(formData));
    const existingUser = await findUserProtection(input.id);

    if (!existingUser) {
      return { ok: false, message: "User not found." };
    }

    if (existingUser.isProtectedSuperAdmin) {
      return { ok: false, message: "Super Admin account is protected and cannot be edited." };
    }

    const passwordHash = input.password ? await bcrypt.hash(input.password, 10) : undefined;
    const user = await updateUser(input, passwordHash);

    if (!user) {
      return { ok: false, message: "User not found." };
    }

    const ipAddress = await getClientIp();
    await createActivityLog({
      action: "UPDATE_USER",
      module: "users",
      description: `Updated user ${user.email}`,
      userId: currentUser.id,
      userName: getUserDisplayName(currentUser),
      ipAddress,
      metadata: {
        userId: user.id,
        email: user.email,
      },
    });

    revalidatePath(USERS_PATH, "page");
    return { ok: true, message: "User updated successfully." };
  } catch (error) {
    return getActionError(error, "Unable to update user. Please try again.");
  }
}

export async function deleteUserFromForm(formData: FormData): Promise<ActionState> {
  const currentUser = await requireUsersPermission();

  try {
    const id = String(formData.get("id") ?? "").trim();

    if (!id) {
      return { ok: false, message: "User id is missing." };
    }

    if (id === currentUser.id) {
      return { ok: false, message: "You cannot delete your own account." };
    }

    const user = await deleteUser(id);

    if (!user) {
      return { ok: false, message: "User not found." };
    }

    if (user.isProtectedSuperAdmin) {
      return { ok: false, message: "Super Admin account is protected and cannot be deleted." };
    }

    await createActivityLog({
      action: "DELETE_USER",
      module: "users",
      description: `Deleted user ${user.email}`,
      userId: currentUser.id,
      userName: getUserDisplayName(currentUser),
      ipAddress: await getClientIp(),
      metadata: {
        deletedUserId: user.id,
        email: user.email,
      },
    });

    revalidatePath(USERS_PATH, "page");
    return { ok: true, message: "User deleted successfully." };
  } catch (error) {
    return getActionError(error, "Unable to delete user. Please try again.");
  }
}
