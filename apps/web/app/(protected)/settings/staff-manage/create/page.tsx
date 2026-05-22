import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { staffService } from "@modules/staff/services/staff.service";
import { StaffForm } from "@modules/staff/views/staffs-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add Staff | MediClinic Pro"
};

export default async function CreateStaffPage() {
  await requirePagePermission("staff.manage");
  const departments = await staffService.listDepartments();
  return <StaffForm departments={departments} />;
}
