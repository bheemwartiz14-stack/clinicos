import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PatientDetails } from "../types/patient.types";
import { calculateAge } from "../helpers/age-calculator.helper";

export function PatientInfoCard({ patient }: { patient: PatientDetails }) {
  return (
    <Card>
      <CardHeader><CardTitle>Basic & Contact Info</CardTitle></CardHeader>
      <CardContent className="grid gap-3 text-sm md:grid-cols-2">
        <p><span className="font-semibold">Patient code:</span> {patient.patientCode}</p>
        <p><span className="font-semibold">Age:</span> {calculateAge(patient.dateOfBirth)} years</p>
        <p><span className="font-semibold">Phone:</span> {patient.phone}</p>
        <p><span className="font-semibold">Email:</span> {patient.email ?? "Not recorded"}</p>
        <p><span className="font-semibold">Gender:</span> {patient.gender ?? "Not recorded"}</p>
        <p><span className="font-semibold">Marital status:</span> {patient.maritalStatus ?? "Not recorded"}</p>
        <p><span className="font-semibold">Blood group:</span> {patient.bloodGroup}</p>
        <p className="md:col-span-2">
          <span className="font-semibold">Address:</span>{" "}
          {patient.address
            ? typeof patient.address === "object"
              ? [
                  patient.address.line1,
                  patient.address.city,
                  patient.address.state,
                  patient.address.postalCode,
                ]
                  .filter(Boolean)
                  .join(", ")
              : patient.address
            : "Not recorded"}
        </p>
      </CardContent>
    </Card>
  );
}
