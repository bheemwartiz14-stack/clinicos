import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PatientDetails } from "../types/patient.types";

export function PatientMedicalInfoCard({ patient }: { patient: PatientDetails }) {
  return (
    <Card>
      <CardHeader><CardTitle>Medical Info</CardTitle></CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <p><span className="font-semibold">Allergies:</span> {patient.allergies || "None recorded"}</p>
        <p><span className="font-semibold">Chronic diseases:</span> {patient.chronicDiseases || "None recorded"}</p>
        <p><span className="font-semibold">Current medications:</span> {patient.currentMedications || "None recorded"}</p>
        <p><span className="font-semibold">Notes:</span> {patient.notes || "No notes"}</p>
      </CardContent>
    </Card>
  );
}
