import { notFound } from "next/navigation";
import { can, type Role } from "@mediclinic/rbac";
import { patientService } from "../services/patient.service";

export const patientController = {
  async listForAdmin(branchId: string, role: Role, search?: string) {
    return {
      patients: await patientService.listPatientsForAdmin(branchId, { search }),
      search: search ?? "",
      canCreate: can(role, "patients.create"),
      canEdit: can(role, "patients.edit"),
      canDelete: can(role, "patients.delete"),
      canManage: can(role, "patients.manage")
    };
  },

  async detailsForAdmin(branchId: string, id: string) {
    const patient = await patientService.getPatientDetailsForAdmin(branchId, id);
    if (!patient) notFound();
    return patient;
  }
};
