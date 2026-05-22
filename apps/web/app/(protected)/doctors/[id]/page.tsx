import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { doctorService } from "@modules/doctors/services/doctor.service";
import { DoctorDetailView } from "@modules/doctors/views/doctors-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Doctor Profile | MediClinic Pro"
};

export default async function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("doctors.view");
  const { id } = await params;
  const [doctor, schedules, leaves, slots] = await Promise.all([
    doctorService.get(id),
    doctorService.schedules(id),
    doctorService.leaves(id),
    doctorService.slots(id)
  ]);
  if (!doctor) notFound();
  return <DoctorDetailView doctor={doctor} schedules={schedules} leaves={leaves} slots={slots} />;
}
