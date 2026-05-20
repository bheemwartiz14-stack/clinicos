import type { Metadata } from "next";
import { can } from "@mediclinic/rbac";
import { requirePermission } from "@/lib/auth";
import { doctorService } from "@modules/doctors/services/doctor.service";
import { DoctorsView } from "@modules/doctors/views/doctors-view";
import type { DoctorRecord } from "@modules/doctors/types/doctor.types";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Doctor Management | MediClinic Pro",
    description: "Manage doctor profiles, specialties, consultation fees, assignments, and scheduling readiness."
  };
}

export default async function DoctorsPage() {
  const session = await requirePermission("doctors.view");
  const doctorsList = await doctorService.list();
  
  const doctors: DoctorRecord[] = doctorsList.map((d) => ({
    id: d.id,
    userId: d.userId,
    branchId: d.branchId,
    branchName: d.branchName ?? null,
    departmentId: d.departmentId ?? null,
    departmentName: d.departmentName ?? null,
    name: `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim() || "Unknown",
    email: d.email,
    phone: d.phone ?? null,
    isActive: d.isActive ?? true,
    specialty: d.specialization,
    licenseNumber: d.licenseNumber ?? "",
    npi: d.npi ?? null,
    experienceYears: d.experienceYears ?? 0,
    consultationFee: d.consultationFee,
    visitDurationMinutes: d.visitDurationMinutes ?? 20,
    appointmentCount: 0,
    updatedAt: new Date().toISOString()
  }));

  return <DoctorsView doctors={doctors} canManage={can(session.role, "doctors.manage")} />;
}
