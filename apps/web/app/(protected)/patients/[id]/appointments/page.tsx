import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { requirePagePermission } from "@/lib/auth";
import { patientService } from "@modules/patients/services/patient.service";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Appointment History | MediClinic Pro",
};

export default async function PatientAppointmentsPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("patients.view");
  const { id } = await params;
  const [patient, appointmentHistory] = await Promise.all([
    patientService.get(id),
    patientService.appointmentHistory(id),
  ]);
  if (!patient) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon"><Link href={`/patients/${id}`}><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Appointment History</h1>
          <p className="text-sm text-muted-foreground">{patient.fullName}</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Calendar className="h-4 w-4 text-emerald-600" /> All Appointments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {appointmentHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.appointmentDate}</span>
                    <span className="text-xs text-muted-foreground">{item.startTime}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground capitalize">{item.type.replace("_", " ")} · {item.reason ?? "General"}</p>
                </div>
                <Badge className={
                  item.status === "completed" ? "border-green-200 bg-green-50 text-green-700" :
                  item.status === "cancelled" ? "border-red-200 bg-red-50 text-red-700" :
                  "border-gray-200 bg-gray-50 text-gray-600"
                }>{item.status}</Badge>
              </div>
            ))}
            {appointmentHistory.length === 0 && (
              <div className="flex flex-col items-center px-4 py-12 text-center">
                <Calendar className="mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No appointments recorded.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
