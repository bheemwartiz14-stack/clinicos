import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePagePermission } from "@/lib/auth";
import { BranchForm } from "@modules/branches/components/branch-form";
import { branchService } from "@modules/branches/services/branch.service";
import { serializeBranch } from "@modules/branches/views/branches-view";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const branch = await branchService.get(id);

  return {
    title: branch ? `Edit ${branch.name} | MediClinic Pro` : "Edit Branch | MediClinic Pro",
    description: "Edit branch profile, address, contact details, operating hours, status, and main branch settings."
  };
}

export default async function EditBranchPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("branches.manage");
  const { id } = await params;
  const branch = await branchService.get(id);

  if (!branch) notFound();

  return <BranchForm branch={serializeBranch(branch)} />;
}
