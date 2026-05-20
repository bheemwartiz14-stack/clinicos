import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { departmentService } from "@modules/departments/services/department.service";
import { DepartmentsView } from "@modules/departments/views/departments-view";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Departments | MediClinic Pro",
    description: "Manage clinic departments, branch assignments, head assignments, and department status."
  };
}

type RawDepartment = {
  id: string;
  branchId: string;
  branchName: string | null;
  name: string;
  code: string | null;
  description: string | null;
  status: "active" | "inactive";
  headId: string | null;
  headName: string | null;
  updatedAt: Date;
  relations: {
    doctors: number;
    staff: number;
  };
};

export default async function DepartmentsPage() {
  await requirePagePermission("departments.manage");
  const departments = (await departmentService.list()) as RawDepartment[];

  const normalizedDepartments = departments.map((department) => ({
    ...department,
    updatedAt: department.updatedAt.toISOString()
  }));

  return <DepartmentsView departments={normalizedDepartments} />;
}
