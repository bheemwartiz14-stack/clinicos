import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { staffService } from "@modules/staff/services/staff.service";
import { StaffListView } from "@modules/staff/views/staffs-view";
import { serializeStaff } from "@modules/staff/utils/serialize-staff";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Staff Management | MediClinic Pro",
    description: "Manage clinic staff profiles, branch assignments, roles, permissions, and shift timings."
  };
}

export default async function ViewStaffPage() {
  await requirePermission("staff.manage");
  const rawStaff = await staffService.list();
  const staff = rawStaff.map((s) => serializeStaff(s as Parameters<typeof serializeStaff>[0]));
  return <StaffListView initialStaff={staff} />;
}
