import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { StaffForm } from "@modules/staff/components/staff-form";
import { branchService } from "@modules/branches/services/branch.service";
import { departmentService } from "@modules/departments/services/department.service";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Create Staff | MediClinic Pro",
    description: "Add a new staff member under the clinic settings area."
  };
}

export default async function CreateStaffPage() {
  await requirePagePermission("staff.manage");

  const branches = await branchService.list();
  const departments = await departmentService.list();

  return <StaffForm branches={branches.map((branch) => ({ id: branch.id, name: branch.name }))} departments={departments.map((department) => ({ id: department.id, name: department.name }))} />;
}
