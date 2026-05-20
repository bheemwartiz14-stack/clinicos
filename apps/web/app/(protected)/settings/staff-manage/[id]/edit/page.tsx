import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePagePermission } from "@/lib/auth";
import { StaffForm } from "@modules/staff/components/staff-form";
import { staffService } from "@modules/staff/services/staff.service";
import { serializeStaff } from "@modules/staff/utils/serialize-staff";
import { branchService } from "@modules/branches/services/branch.service";
import { departmentService } from "@modules/departments/services/department.service";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const staff = await staffService.get(id);

  return {
    title: staff ? `Edit ${staff.name} | MediClinic Pro` : "Edit Staff | MediClinic Pro",
    description: "Edit staff member assignments, profile, and account details."
  };
}

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("staff.manage");
  const { id } = await params;
  const staff = await staffService.get(id);

  if (!staff) notFound();

  const branches = await branchService.list();
  const departments = await departmentService.list();

  return (
    <StaffForm
      staff={serializeStaff(staff as Parameters<typeof serializeStaff>[0])}
      branches={branches.map((branch) => ({ id: branch.id, name: branch.name }))}
      departments={departments.map((department) => ({ id: department.id, name: department.name }))}
    />
  );
}
