import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePagePermission } from "@/lib/auth";
import { StaffDetail } from "@modules/staff/components/staff-detail";
import { staffService } from "@modules/staff/services/staff.service";
import { serializeStaff } from "@modules/staff/utils/serialize-staff";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const staff = await staffService.get(id);

  return {
    title: staff ? `${staff.name} | MediClinic Pro` : "Staff Member | MediClinic Pro",
    description: "View staff member profile, branch mapping, role, and working schedule."
  };
}

export default async function StaffViewPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("staff.manage");
  const { id } = await params;
  const staff = await staffService.get(id);

  if (!staff) notFound();

  return <StaffDetail staff={serializeStaff(staff as Parameters<typeof serializeStaff>[0])} />;
}
