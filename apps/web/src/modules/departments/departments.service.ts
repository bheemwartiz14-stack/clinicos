import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { getClientIp } from "@/hooks/common";
import { getCurrentUser } from "@/modules/auth/auth.service";
import { hasAnyPermission } from "@/modules/auth/permissions";
import { createActivityLog } from "@/modules/setting/audit-logs/hooks/audit-logs.logger";
import { getDepartmentsPageModel } from "./departments.model";
import {
  countActiveDepartments,
  countDepartments,
  createDepartment,
  deleteDepartment,
  findDepartments,
  updateDepartment,
} from "./departments.repository";
import type { ActionState, DepartmentsPageSearchParams } from "./departments.types";
import { createDepartmentSchema, updateDepartmentSchema } from "./departments.validation";

const DEPARTMENTS_PATH = "/doctors/department";

async function requireDepartmentsPermission() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  if (
    user.role !== "admin" &&
    !hasAnyPermission(user.permissions, [
      "departments.manage",
      "departments.view",
      "departments.create",
      "departments.edit",
      "departments.delete",
      "settings.manage",
    ])
  ) {
    redirect("/dashboard");
  }

  return user;
}

function emptyToUndefined(value: FormDataEntryValue | null) {
  const stringValue = String(value ?? "").trim();
  return stringValue.length > 0 ? stringValue : undefined;
}

function parseDepartmentForm(formData: FormData) {
  return {
    name: formData.get("name"),
    code: emptyToUndefined(formData.get("code")),
    departmentHeadId: emptyToUndefined(formData.get("departmentHeadId")),
    description: emptyToUndefined(formData.get("description")),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  };
}

function parseUpdateDepartmentForm(formData: FormData) {
  return {
    id: String(formData.get("id") ?? "").trim(),
    ...parseDepartmentForm(formData),
  };
}

function getUserDisplayName(user: { name?: string | null; email?: string | null }) {
  return user.name ?? user.email ?? "Unknown user";
}

function getActionError(error: unknown, fallback: string): ActionState {
  if (error instanceof ZodError) {
    return {
      ok: false,
      message: error.issues[0]?.message ?? "Please check the department details and try again.",
    };
  }

  if (
    error instanceof Error &&
    (error.message.includes("duplicate key") || error.message.includes("unique"))
  ) {
    return {
      ok: false,
      message: "A department with this name or code already exists.",
    };
  }

  console.error("Department action error:", error);
  return { ok: false, message: fallback };
}

export async function getDepartmentsPageData(
  searchParams: Promise<DepartmentsPageSearchParams>,
) {
  await requireDepartmentsPermission();

  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [departments, totalDepartments, activeDepartments] = await Promise.all([
    findDepartments({ query }),
    countDepartments(query),
    countActiveDepartments(),
  ]);

  return getDepartmentsPageModel({
    departments,
    query,
    stats: {
      totalDepartments,
      activeDepartments,
      inactiveDepartments: Math.max(0, totalDepartments - activeDepartments),
    },
  });
}

export async function createDepartmentFromForm(formData: FormData): Promise<ActionState> {
  const user = await requireDepartmentsPermission();

  try {
    const input = createDepartmentSchema.parse(parseDepartmentForm(formData));
    const department = await createDepartment(input);

    if (!department) {
      return { ok: false, message: "Unable to create department." };
    }

    await createActivityLog({
      action: "CREATE_DEPARTMENT",
      module: "departments",
      description: `Created department ${department.name}`,
      userId: user.id,
      userName: getUserDisplayName(user),
      ipAddress: await getClientIp(),
      metadata: {
        departmentId: department.id,
        departmentName: department.name,
      },
    });

    revalidatePath(DEPARTMENTS_PATH, "page");
    return { ok: true, message: "Department created successfully." };
  } catch (error) {
    return getActionError(error, "Unable to create department. Please try again.");
  }
}

export async function updateDepartmentFromForm(formData: FormData): Promise<ActionState> {
  const user = await requireDepartmentsPermission();

  try {
    const input = updateDepartmentSchema.parse(parseUpdateDepartmentForm(formData));
    const department = await updateDepartment(input);

    if (!department) {
      return { ok: false, message: "Department not found." };
    }

    await createActivityLog({
      action: "UPDATE_DEPARTMENT",
      module: "departments",
      description: `Updated department ${department.name}`,
      userId: user.id,
      userName: getUserDisplayName(user),
      ipAddress: await getClientIp(),
      metadata: {
        departmentId: department.id,
        departmentName: department.name,
      },
    });

    revalidatePath(DEPARTMENTS_PATH, "page");
    return { ok: true, message: "Department updated successfully." };
  } catch (error) {
    return getActionError(error, "Unable to update department. Please try again.");
  }
}

export async function deleteDepartmentFromForm(formData: FormData): Promise<ActionState> {
  const user = await requireDepartmentsPermission();

  try {
    const id = String(formData.get("id") ?? "").trim();

    if (!id) {
      return { ok: false, message: "Department id is missing." };
    }

    const department = await deleteDepartment(id);

    if (!department) {
      return { ok: false, message: "Department not found." };
    }

    await createActivityLog({
      action: "DELETE_DEPARTMENT",
      module: "departments",
      description: `Deleted department ${department.name}`,
      userId: user.id,
      userName: getUserDisplayName(user),
      ipAddress: await getClientIp(),
      metadata: {
        departmentId: department.id,
        departmentName: department.name,
      },
    });

    revalidatePath(DEPARTMENTS_PATH, "page");
    return { ok: true, message: "Department deleted successfully." };
  } catch (error) {
    return getActionError(error, "Unable to delete department. Please try again.");
  }
}
