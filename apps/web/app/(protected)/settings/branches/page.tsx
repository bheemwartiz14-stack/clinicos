import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { branchService } from "@modules/branches/services/branch.service";
import { BranchesView } from "@modules/branches/views/branches-view";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Branches | MediClinic Pro",
    description: "Manage branch profiles, addresses, contact details, operating hours, status, and operational relations."
  };
}

export default async function BranchesPage() {
  await requirePermission("branches.manage");
  const branches = await branchService.list();
  return <BranchesView branches={branches} />;
}
