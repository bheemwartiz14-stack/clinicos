import { BranchManagement, type BranchRecord } from "../components/branch-management";
import type { BranchWithRelations } from "../repositories/branch.repository";
import { defaultOperatingHours, operatingHoursSchema } from "../validations/branch.validation";

export function serializeBranch(branch: BranchWithRelations): BranchRecord {
  const operatingHours = operatingHoursSchema.safeParse(branch.operatingHours);

  return {
    id: branch.id,
    name: branch.name,
    npi: branch.npi,
    profile: branch.profile,
    phone: branch.phone,
    email: branch.email,
    addressLine1: branch.addressLine1,
    addressLine2: branch.addressLine2,
    city: branch.city,
    state: branch.state,
    postalCode: branch.postalCode,
    timezone: branch.timezone,
    status: branch.status,
    isMain: branch.isMain,
    operatingHours: operatingHours.success ? operatingHours.data : defaultOperatingHours,
    updatedAt: branch.updatedAt.toISOString(),
    relations: branch.relations
  };
}

export function BranchesView({ branches }: { branches: BranchWithRelations[] }) {
  return <BranchManagement branches={branches.map(serializeBranch)} />;
}
