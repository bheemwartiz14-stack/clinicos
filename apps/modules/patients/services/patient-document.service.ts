import { patientService } from "./patient.service";

export const patientDocumentService = {
  create: patientService.createDocument
};
