import { patientService } from "./patient.service";

export const patientNoteService = {
  create: patientService.createNote
};
