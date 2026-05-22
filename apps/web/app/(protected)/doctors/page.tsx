import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { doctorService } from "@modules/doctors/services/doctor.service";
import { DoctorsListView } from "@modules/doctors/views/doctors-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Doctors | MediClinic Pro"
};

export default async function DoctorsPage({ searchParams }: { searchParams?: Promise<{ password?: string }> }) {
  await requirePagePermission("doctors.view");
  const params = searchParams ? await searchParams : {};
  const doctors = await doctorService.list();
  return <DoctorsListView doctors={doctors} generatedPassword={params.password} />;
}
