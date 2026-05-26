import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { requirePagePermission } from "@/lib/auth";
import { patientService } from "@modules/patients/services/patient.service";
import { ArrowLeft, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Medical History | MediClinic Pro",
};

export default async function PatientMedicalHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("patients.view");
  const { id } = await params;
  const [patient, medicalHistory] = await Promise.all([
    patientService.get(id),
    patientService.medicalHistory(id),
  ]);
  if (!patient) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon"><Link href={`/patients/${id}`}><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Medical History</h1>
          <p className="text-sm text-muted-foreground">{patient.fullName}</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Stethoscope className="h-4 w-4 text-violet-600" /> Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {medicalHistory.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Stethoscope className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No medical history recorded.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {medicalHistory.map((item) => (
                <div key={item.id} className="rounded-lg border-l-4 border-l-violet-500 bg-muted/20 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold">{item.condition}</p>
                      {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{item.diagnosedAt ?? ""}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
