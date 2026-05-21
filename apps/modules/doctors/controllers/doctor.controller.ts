import { notFound } from "next/navigation";
import { can, type Role } from "@mediclinic/rbac";
import { doctorService } from "../services/doctor.service";

export const doctorController = {
  async listForAdmin(role: Role) {
    return {
      doctors: await doctorService.listDoctorsForAdmin(),
      canCreate: can(role, "doctors.create"),
      canEdit: can(role, "doctors.edit"),
      canDelete: can(role, "doctors.delete"),
      canManage: can(role, "doctors.manage") || can(role, "doctors.manage-all")
    };
  },

  async detailsForAdmin(id: string) {
    const doctor = await doctorService.getDoctorDetailsForAdmin(id);
    if (!doctor) notFound();
    return doctor;
  },

  async formOptions() {
    return doctorService.getDoctorFormOptions();
  }
};
