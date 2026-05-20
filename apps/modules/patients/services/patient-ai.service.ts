import { patientService } from "./patient.service";

export const patientAiService = {
  createSummary: patientService.createAiSummary,
  createFollowupSuggestion: patientService.createFollowupSuggestion
};
