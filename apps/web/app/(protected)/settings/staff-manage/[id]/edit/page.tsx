import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { staffService } from "@modules/staff/services/staff.service";
import { StaffForm } from "@modules/staff/views/staffs-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Staff | MediClinic Pro"
};

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("staff.manage");
  const { id } = await params;
  const [staff, departments] = await Promise.all([staffService.get(id), staffService.listDepartments()]);
  if (!staff) notFound();
  return <StaffForm staff={staff} departments={departments} />;
}
