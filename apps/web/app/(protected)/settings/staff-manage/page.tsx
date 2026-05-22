import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { staffService } from "@modules/staff/services/staff.service";
import { StaffListView } from "@modules/staff/views/staffs-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Staff Management | MediClinic Pro"
};

export default async function StaffManagePage() {
  await requirePagePermission("staff.manage");
  const staff = await staffService.list();
  return <StaffListView staff={staff} />;
}
