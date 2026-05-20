import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { DepartmentDetail } from "@modules/departments/components/department-detail";
import { departmentService } from "@modules/departments/services/department.service";
import { serializeDepartment } from "@modules/departments/views/departments-view";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const department = await departmentService.get(id);

  return {
    title: department ? `${department.name} | MediClinic Pro` : "Department | MediClinic Pro",
    description: "View department profile, branch mapping, head assignment, and relation counts."
  };
}

export default async function DepartmentViewPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("departments.manage");
  const { id } = await params;
  const department = await departmentService.get(id);

  if (!department) notFound();

  return <DepartmentDetail department={serializeDepartment(department)} />;
}
