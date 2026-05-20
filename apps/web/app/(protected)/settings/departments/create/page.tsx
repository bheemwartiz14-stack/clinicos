import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { DepartmentForm } from "@modules/departments/components/department-form";
import { branchService } from "@modules/branches/services/branch.service";
import { departmentService } from "@modules/departments/services/department.service";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Create Department | MediClinic Pro",
    description: "Create a department with branch mapping, head assignment, status, and description."
  };
}

export default async function CreateDepartmentPage() {
  await requirePagePermission("departments.manage");

  const branches = await branchService.list();
  const heads = await departmentService.listHeads();

  return <DepartmentForm branches={branches.map((branch) => ({ id: branch.id, name: branch.name }))} heads={heads} />;
}
