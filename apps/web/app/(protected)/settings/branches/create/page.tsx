import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { BranchForm } from "@modules/branches/components/branch-form";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Create Branch | MediClinic Pro",
    description: "Create a clinic branch with profile, address, contact details, operating hours, and status."
  };
}

export default async function CreateBranchPage() {
  await requirePermission("branches.manage");

  return <BranchForm />;
}
