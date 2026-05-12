import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { getClientIp } from "@/hooks/common";
import { getCurrentUser } from "@/modules/auth/auth.service";
import { hasAnyPermission } from "@/modules/auth/permissions";
import { createActivityLog } from "@/modules/setting/audit-logs/hooks/audit-logs.logger";
import { getBranchesPageModel } from "./branches.model";
import {
  countActiveBranches,
  countBranches,
  countMainBranches,
  createBranch,
  deleteBranch,
  findBranches,
  updateBranch,
} from "./branches.repository";
import type { ActionState, BranchesPageSearchParams } from "./branches.types";
import { createBranchSchema, updateBranchSchema } from "./branches.validation";

const BRANCHES_PATH = "/setting/branches";

async function requireBranchesPermission() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  if (
    user.role !== "admin" &&
    !hasAnyPermission(user.permissions, [
      "branches.view",
      "branches.create",
      "branches.edit",
      "branches.delete",
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

function parseBranchForm(formData: FormData) {
  return {
    name: formData.get("name"),
    code: formData.get("code"),
    type: emptyToUndefined(formData.get("type")) ?? "clinic",
    supportEmail: emptyToUndefined(formData.get("supportEmail")),
    supportPhone: emptyToUndefined(formData.get("supportPhone")),
    managerId: emptyToUndefined(formData.get("managerId")),
    address: {
      addressLine1: emptyToUndefined(formData.get("addressLine1")),
      addressLine2: emptyToUndefined(formData.get("addressLine2")),
      city: emptyToUndefined(formData.get("city")),
      state: emptyToUndefined(formData.get("state")),
      country: emptyToUndefined(formData.get("country")),
      postalCode: emptyToUndefined(formData.get("postalCode")),
    },
    notes: emptyToUndefined(formData.get("notes")),
    isMain: formData.get("isMain") === "on" || formData.get("isMain") === "true",
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  };
}

function parseUpdateBranchForm(formData: FormData) {
  return {
    id: String(formData.get("id") ?? "").trim(),
    ...parseBranchForm(formData),
  };
}

function getUserDisplayName(user: { name?: string | null; email?: string | null }) {
  return user.name ?? user.email ?? "Unknown user";
}

function getActionError(error: unknown, fallback: string): ActionState {
  if (error instanceof ZodError) {
    return {
      ok: false,
      message: error.issues[0]?.message ?? "Please check the branch details and try again.",
    };
  }

  if (
    error instanceof Error &&
    (error.message.includes("duplicate key") || error.message.includes("unique"))
  ) {
    return {
      ok: false,
      message: "A branch with this code already exists.",
    };
  }

  console.error("Branch action error:", error);
  return { ok: false, message: fallback };
}

export async function getBranchesPageData(searchParams: Promise<BranchesPageSearchParams>) {
  await requireBranchesPermission();

  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [branches, totalBranches, activeBranches, mainBranches] = await Promise.all([
    findBranches({ query }),
    countBranches(query),
    countActiveBranches(),
    countMainBranches(),
  ]);

  return getBranchesPageModel({
    branches,
    query,
    stats: {
      totalBranches,
      activeBranches,
      mainBranches,
    },
  });
}

export async function createBranchFromForm(formData: FormData): Promise<ActionState> {
  const user = await requireBranchesPermission();

  try {
    const input = createBranchSchema.parse(parseBranchForm(formData));
    const branch = await createBranch(input);

    if (!branch) {
      return { ok: false, message: "Unable to create branch." };
    }

    await createActivityLog({
      action: "CREATE_BRANCH",
      module: "branches",
      description: `Created branch ${branch.name}`,
      userId: user.id,
      userName: getUserDisplayName(user),
      ipAddress: await getClientIp(),
      metadata: { branchId: branch.id, branchName: branch.name },
    });

    revalidatePath(BRANCHES_PATH, "page");
    return { ok: true, message: "Branch created successfully." };
  } catch (error) {
    return getActionError(error, "Unable to create branch. Please try again.");
  }
}

export async function updateBranchFromForm(formData: FormData): Promise<ActionState> {
  const user = await requireBranchesPermission();

  try {
    const input = updateBranchSchema.parse(parseUpdateBranchForm(formData));
    const branch = await updateBranch(input);

    if (!branch) {
      return { ok: false, message: "Branch not found." };
    }

    await createActivityLog({
      action: "UPDATE_BRANCH",
      module: "branches",
      description: `Updated branch ${branch.name}`,
      userId: user.id,
      userName: getUserDisplayName(user),
      ipAddress: await getClientIp(),
      metadata: { branchId: branch.id, branchName: branch.name },
    });

    revalidatePath(BRANCHES_PATH, "page");
    return { ok: true, message: "Branch updated successfully." };
  } catch (error) {
    return getActionError(error, "Unable to update branch. Please try again.");
  }
}

export async function deleteBranchFromForm(formData: FormData): Promise<ActionState> {
  const user = await requireBranchesPermission();

  try {
    const id = String(formData.get("id") ?? "").trim();

    if (!id) {
      return { ok: false, message: "Branch id is missing." };
    }

    const branch = await deleteBranch(id);

    if (!branch) {
      return { ok: false, message: "Branch not found." };
    }

    await createActivityLog({
      action: "DELETE_BRANCH",
      module: "branches",
      description: `Deleted branch ${branch.name}`,
      userId: user.id,
      userName: getUserDisplayName(user),
      ipAddress: await getClientIp(),
      metadata: { branchId: branch.id, branchName: branch.name },
    });

    revalidatePath(BRANCHES_PATH, "page");
    return { ok: true, message: "Branch deleted successfully." };
  } catch (error) {
    return getActionError(error, "Unable to delete branch. Please try again.");
  }
}
