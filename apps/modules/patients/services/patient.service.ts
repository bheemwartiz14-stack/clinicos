import {
  createPatient,
  createPatientDocument,
  createPatientMedicalHistory,
  createPatientNote,
  getPatientProfile,
  listPatients,
  savePatientAiSummary,
  savePatientFollowupSuggestion,
  softDeletePatient,
  updatePatient
} from "../repositories/patient.repository";
import { buildFollowupSuggestion, buildPatientAiSummary } from "../utils/patient-ai-summary";
import {
  patientAISummaryRequestSchema,
  patientCreateSchema,
  patientDocumentUploadSchema,
  patientFollowupSuggestionSchema,
  patientMedicalHistorySchema,
  patientNoteSchema,
  patientSearchSchema,
  patientUpdateSchema,
  type PatientAISummaryRequestInput,
  type PatientCreateInput,
  type PatientDocumentUploadInput,
  type PatientFollowupSuggestionInput,
  type PatientMedicalHistoryInput,
  type PatientNoteInput,
  type PatientSearchInput,
  type PatientUpdateInput
} from "../validations/patient.validation";

export const patientService = {
  list(branchId: string, search?: PatientSearchInput) {
    return listPatients(branchId, search ? patientSearchSchema.parse(search) : undefined);
  },

  profile(branchId: string, patientId: string) {
    return getPatientProfile(branchId, patientId);
  },

  create(branchId: string, input: PatientCreateInput, userId?: string) {
    return createPatient(branchId, patientCreateSchema.parse(input), userId);
  },

  update(branchId: string, input: PatientUpdateInput, userId?: string) {
    return updatePatient(branchId, patientUpdateSchema.parse(input), userId);
  },

  remove(branchId: string, patientId: string, userId?: string) {
    return softDeletePatient(branchId, patientId, userId);
  },

  createNote(authorUserId: string, input: PatientNoteInput) {
    return createPatientNote(authorUserId, patientNoteSchema.parse(input));
  },

  createMedicalHistory(authorUserId: string, input: PatientMedicalHistoryInput) {
    return createPatientMedicalHistory(authorUserId, patientMedicalHistorySchema.parse(input));
  },

  createDocument(uploadedByUserId: string, input: PatientDocumentUploadInput) {
    return createPatientDocument(uploadedByUserId, patientDocumentUploadSchema.parse(input));
  },

  async createAiSummary(requestedByUserId: string, branchId: string, input: PatientAISummaryRequestInput) {
    const parsed = patientAISummaryRequestSchema.parse(input);
    const profile = await getPatientProfile(branchId, parsed.patientId);
    if (!profile) throw new Error("Patient not found.");
    const summary = buildPatientAiSummary({
      patient: profile.patient,
      appointments: profile.appointmentHistory,
      invoices: profile.billingHistory,
      notes: profile.notes
    });
    return savePatientAiSummary(requestedByUserId, parsed.patientId, summary, {
      appointmentCount: profile.appointmentHistory.length,
      invoiceCount: profile.billingHistory.length,
      noteCount: profile.notes.length
    }, parsed.summaryType);
  },

  async createFollowupSuggestion(requestedByUserId: string, branchId: string, input: Pick<PatientFollowupSuggestionInput, "patientId">) {
    const profile = await getPatientProfile(branchId, input.patientId);
    if (!profile) throw new Error("Patient not found.");
    const suggestion = buildFollowupSuggestion({
      patient: profile.patient,
      appointments: profile.appointmentHistory,
      invoices: profile.billingHistory,
      notes: profile.notes
    });
    return savePatientFollowupSuggestion(requestedByUserId, patientFollowupSuggestionSchema.parse({ patientId: input.patientId, ...suggestion }));
  }
};
