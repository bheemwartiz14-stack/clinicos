import { patientFormSchema, patientUpdateSchema, type PatientFormInput, type PatientUpdateInput } from "../schemas/patient.schema";
import * as patientRepository from "../repositories/patient.repository";

async function assertUniquePatient(branchId: string, input: PatientFormInput | PatientUpdateInput, currentPatientId?: string) {
  const patientCode = input.patientCode;
  if (patientCode) {
    const existing = await patientRepository.getPatientByCode(branchId, patientCode);
    if (existing && existing.id !== currentPatientId) throw new Error("Patient code already exists.");
  }

  const phoneMatch = await patientRepository.getPatientByPhone(branchId, input.phone);
  if (phoneMatch && phoneMatch.id !== currentPatientId) throw new Error("Phone number already exists.");

  if (input.email) {
    const emailMatch = await patientRepository.getPatientByEmail(branchId, input.email);
    if (emailMatch && emailMatch.id !== currentPatientId) throw new Error("Email already exists.");
  }
}

export async function listPatientsForAdmin(branchId: string, filter?: { search?: string }) {
  return patientRepository.getPatients(branchId, filter);
}

export async function getPatientDetailsForAdmin(branchId: string, id: string) {
  return patientRepository.getPatientById(branchId, id);
}

export async function getPatientById(id: string) {
  return patientRepository.getPatientByIdAnyBranch(id);
}

export async function createPatientFromForm(branchId: string, userId: string, input: PatientFormInput) {
  const parsed = patientFormSchema.parse(input);
  const patientCode = parsed.patientCode || await patientRepository.generateUniquePatientCode(branchId);
  await assertUniquePatient(branchId, { ...parsed, patientCode });
  return patientRepository.createPatient(branchId, { ...parsed, patientCode, userId });
}

export async function updatePatientFromForm(branchId: string, userId: string, input: PatientUpdateInput) {
  const parsed = patientUpdateSchema.parse(input);
  await assertUniquePatient(branchId, parsed, parsed.id);
  return patientRepository.updatePatient(branchId, { ...parsed, userId });
}

export async function deletePatientFromForm(branchId: string, id: string) {
  if (await patientRepository.checkPatientHasAppointments(id)) {
    throw new Error("Patient cannot be deleted because appointments exist.");
  }
  return patientRepository.deletePatient(branchId, id);
}

export async function togglePatientStatusFromForm(branchId: string, id: string) {
  return patientRepository.togglePatientStatus(branchId, id);
}

export const patientService = {
  list: listPatientsForAdmin,
  listPatientsForAdmin,
  getById: getPatientById,
  getPatientDetailsForAdmin,
  createPatientFromForm,
  updatePatientFromForm,
  deletePatientFromForm,
  togglePatientStatusFromForm
};
