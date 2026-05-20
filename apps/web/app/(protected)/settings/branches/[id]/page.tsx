import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { BranchDetail } from "@modules/branches/components/branch-detail";
import { branchService } from "@modules/branches/services/branch.service";
import { serializeBranch } from "@modules/branches/views/branches-view";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const branch = await branchService.get(id);

  return {
    title: branch ? `${branch.name} | MediClinic Pro` : "Branch | MediClinic Pro",
    description: "View branch profile, address, contact details, operating hours, status, and relations."
  };
}

export default async function BranchViewPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("branches.manage");
  const { id } = await params;
  const branch = await branchService.get(id);

  if (!branch) notFound();

  return <BranchDetail branch={serializeBranch(branch)} />;
}
