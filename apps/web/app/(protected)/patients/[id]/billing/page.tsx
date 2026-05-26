import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { requirePagePermission } from "@/lib/auth";
import { patientService } from "@modules/patients/services/patient.service";
import { ArrowLeft, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Billing History | MediClinic Pro",
};

export default async function PatientBillingPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePagePermission("patients.view");
  const { id } = await params;
  const [patient, billingHistory] = await Promise.all([
    patientService.get(id),
    patientService.billingHistory(id),
  ]);
  if (!patient) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon"><Link href={`/patients/${id}`}><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Billing History</h1>
          <p className="text-sm text-muted-foreground">{patient.fullName}</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Receipt className="h-4 w-4 text-amber-600" /> Invoices
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {billingHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <span className="font-semibold">{item.invoiceNumber}</span>
                  <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">${item.totalAmount}</span>
                  <Badge className={
                    item.paymentStatus === "paid" ? "border-green-200 bg-green-50 text-green-700" :
                    item.paymentStatus === "pending" ? "border-yellow-200 bg-yellow-50 text-yellow-700" :
                    "border-red-200 bg-red-50 text-red-700"
                  }>{item.paymentStatus}</Badge>
                </div>
              </div>
            ))}
            {billingHistory.length === 0 && (
              <div className="flex flex-col items-center px-4 py-12 text-center">
                <Receipt className="mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No billing records.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
