import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { requirePagePermission } from "@/lib/auth";
import { patientService } from "@modules/patients/services/patient.service";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Patient Notes | MediClinic Pro",
};

export default async function PatientNotesPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("patients.view");
  const { id } = await params;
  const [patient, notes] = await Promise.all([
    patientService.get(id),
    patientService.notes(id),
  ]);
  if (!patient) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon"><Link href={`/patients/${id}`}><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Patient Notes</h1>
          <p className="text-sm text-muted-foreground">{patient.fullName}</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-violet-600" /> Clinical Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <FileText className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No notes recorded.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((item) => (
                <div key={item.id} className="rounded-lg border p-4">
                  <p className="text-sm">{item.note}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
