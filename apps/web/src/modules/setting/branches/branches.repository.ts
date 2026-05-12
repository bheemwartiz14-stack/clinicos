import { db, schema } from "@mediclinicpro/db";
import { count, desc, eq, ilike, or } from "drizzle-orm";
import type { BranchInput, BranchListItem, UpdateBranchInput } from "./branches.types";

type FindBranchesOptions = {
  query?: string;
  limit?: number;
};

type BranchRow = typeof schema.branches.$inferSelect;

type BranchWithManagerRow = {
  branch: BranchRow;
  managerFirstName: string | null;
  managerLastName: string | null;
  managerEmail: string | null;
};

function getManagerName(row: BranchWithManagerRow) {
  const fullName = [row.managerFirstName, row.managerLastName].filter(Boolean).join(" ").trim();
  return fullName || row.managerEmail || null;
}

function mapBranch(row: BranchRow): BranchListItem {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    type: row.type,
    supportEmail: row.supportEmail,
    supportPhone: row.supportPhone,
    managerId: row.managerId,
    managerName: null,
    address: row.address,
    notes: row.notes,
    isMain: row.isMain,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapBranchWithManager(row: BranchWithManagerRow): BranchListItem {
  return {
    ...mapBranch(row.branch),
    managerName: getManagerName(row),
  };
}

function buildBranchSearch(query?: string) {
  const normalizedQuery = query?.trim();

  if (!normalizedQuery) {
    return undefined;
  }

  const search = `%${normalizedQuery}%`;

  return or(
    ilike(schema.branches.name, search),
    ilike(schema.branches.code, search),
    ilike(schema.branches.type, search),
    ilike(schema.branches.supportEmail, search),
    ilike(schema.branches.supportPhone, search),
  );
}

export async function findBranches({
  limit = 50,
  query,
}: FindBranchesOptions = {}): Promise<BranchListItem[]> {
  const branches = await db
    .select({
      branch: schema.branches,
      managerFirstName: schema.userProfiles.firstName,
      managerLastName: schema.userProfiles.lastName,
      managerEmail: schema.users.email,
    })
    .from(schema.branches)
    .leftJoin(schema.users, eq(schema.branches.managerId, schema.users.id))
    .leftJoin(schema.userProfiles, eq(schema.users.id, schema.userProfiles.userId))
    .where(buildBranchSearch(query))
    .orderBy(desc(schema.branches.updatedAt))
    .limit(limit);

  return branches.map(mapBranchWithManager);
}

export async function countBranches(query?: string) {
  const [result] = await db
    .select({ value: count() })
    .from(schema.branches)
    .where(buildBranchSearch(query));

  return Number(result?.value ?? 0);
}

export async function countActiveBranches() {
  const [result] = await db
    .select({ value: count() })
    .from(schema.branches)
    .where(eq(schema.branches.isActive, true));

  return Number(result?.value ?? 0);
}

export async function countMainBranches() {
  const [result] = await db
    .select({ value: count() })
    .from(schema.branches)
    .where(eq(schema.branches.isMain, true));

  return Number(result?.value ?? 0);
}

export async function createBranch(input: BranchInput) {
  const [branch] = await db
    .insert(schema.branches)
    .values({
      name: input.name,
      code: input.code,
      type: input.type,
      supportEmail: input.supportEmail ?? null,
      supportPhone: input.supportPhone ?? null,
      managerId: input.managerId ?? null,
      address: input.address ?? null,
      notes: input.notes ?? null,
      isMain: input.isMain,
      isActive: input.isActive,
    })
    .returning();

  return branch ? mapBranch(branch) : null;
}

export async function updateBranch(input: UpdateBranchInput) {
  const [branch] = await db
    .update(schema.branches)
    .set({
      name: input.name,
      code: input.code,
      type: input.type,
      supportEmail: input.supportEmail ?? null,
      supportPhone: input.supportPhone ?? null,
      managerId: input.managerId ?? null,
      address: input.address ?? null,
      notes: input.notes ?? null,
      isMain: input.isMain,
      isActive: input.isActive,
      updatedAt: new Date(),
    })
    .where(eq(schema.branches.id, input.id))
    .returning();

  return branch ? mapBranch(branch) : null;
}

export async function deleteBranch(id: string) {
  const [branch] = await db
    .delete(schema.branches)
    .where(eq(schema.branches.id, id))
    .returning({
      id: schema.branches.id,
      name: schema.branches.name,
    });

  return branch ?? null;
}
