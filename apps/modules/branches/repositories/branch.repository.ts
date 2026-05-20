import { and, asc, count, eq, ne } from "drizzle-orm";
import { appointments, branches, db, departments, doctors, invoices, payrollRuns, users } from "@mediclinic/db";
import type { BranchUpdateInput, BranchUpsertInput } from "../validations/branch.validation";

export type BranchWithRelations = Awaited<ReturnType<typeof listBranches>>[number];

async function relationCounts(branchId: string) {
  const [doctorCount, departmentCount, staffCount, appointmentCount, billingCount, payrollCount] = await Promise.all([
    db.select({ total: count() }).from(doctors).where(eq(doctors.branchId, branchId)),
    db.select({ total: count() }).from(departments).where(eq(departments.branchId, branchId)),
    db.select({ total: count() }).from(users).where(eq(users.branchId, branchId)),
    db.select({ total: count() }).from(appointments).where(eq(appointments.branchId, branchId)),
    db.select({ total: count() }).from(invoices).where(eq(invoices.branchId, branchId)),
    db.select({ total: count() }).from(payrollRuns).where(eq(payrollRuns.branchId, branchId))
  ]);

  return {
    doctors: doctorCount[0]?.total ?? 0,
    departments: departmentCount[0]?.total ?? 0,
    staff: staffCount[0]?.total ?? 0,
    appointments: appointmentCount[0]?.total ?? 0,
    billing: billingCount[0]?.total ?? 0,
    payroll: payrollCount[0]?.total ?? 0
  };
}

export async function listBranches() {
  const records = await db.select().from(branches).orderBy(asc(branches.name));
  return Promise.all(records.map(async (branch) => ({ ...branch, relations: await relationCounts(branch.id) })));
}

export async function getBranchById(id: string) {
  const [branch] = await db.select().from(branches).where(eq(branches.id, id)).limit(1);
  return branch ? { ...branch, relations: await relationCounts(branch.id) } : null;
}

export async function createBranch(input: BranchUpsertInput) {
  return db.transaction(async (tx) => {
    if (input.isMain) {
      await tx.update(branches).set({ isMain: false, updatedAt: new Date() }).where(eq(branches.isMain, true));
    }

    const [branch] = await tx
      .insert(branches)
      .values({
        ...input,
        npi: input.npi || null,
        email: input.email || null,
        addressLine2: input.addressLine2 || null,
        state: input.state.toUpperCase()
      })
      .returning();

    return branch;
  });
}

export async function updateBranch(input: BranchUpdateInput) {
  return db.transaction(async (tx) => {
    if (input.isMain) {
      await tx.update(branches).set({ isMain: false, updatedAt: new Date() }).where(and(eq(branches.isMain, true), ne(branches.id, input.id)));
    }

    const [branch] = await tx
      .update(branches)
      .set({
        name: input.name,
        npi: input.npi || null,
        profile: input.profile,
        phone: input.phone,
        email: input.email || null,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 || null,
        city: input.city,
        state: input.state.toUpperCase(),
        postalCode: input.postalCode,
        timezone: input.timezone,
        status: input.status,
        isMain: input.isMain,
        operatingHours: input.operatingHours,
        updatedAt: new Date()
      })
      .where(eq(branches.id, input.id))
      .returning();

    return branch;
  });
}

export async function deleteOrDeactivateBranch(id: string) {
  const counts = await relationCounts(id);
  const hasRelations = Object.values(counts).some((total) => total > 0);

  if (hasRelations) {
    const [branch] = await db
      .update(branches)
      .set({ status: "inactive", isMain: false, updatedAt: new Date() })
      .where(eq(branches.id, id))
      .returning();

    return { mode: "deactivated" as const, branch, relations: counts };
  }

  const [branch] = await db.delete(branches).where(eq(branches.id, id)).returning();
  return { mode: "deleted" as const, branch, relations: counts };
}
