import { ClipboardList, FilePlus, Pill, Stethoscope } from "lucide-react";

const prescriptions = [
  ["Priya Raman", "Paracetamol 500mg", "Twice daily for 5 days", "Dr. Smith"],
  ["Arjun Sinha", "Azithromycin", "Once daily for 3 days", "Dr. Brown"],
  ["Meera Iyer", "Vitamin D3", "Weekly for 8 weeks", "Dr. Wilson"],
  ["Anita Verma", "Cetirizine 10mg", "At night for 7 days", "Dr. Smith"],
];

export default function PrescriptionsPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Prescriptions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and review digital prescriptions for patient visits.
          </p>
        </div>

        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          type="button"
        >
          <FilePlus className="size-4" />
          New prescription
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Issued today", "42", ClipboardList],
          ["Medicines used", "118", Pill],
          ["Doctors active", "12", Stethoscope],
        ].map(([label, value, Icon]) => (
          <div key={label as string} className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label as string}</p>
              <Icon className="size-5 text-primary" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-foreground">{value as string}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold text-foreground">Recent Prescriptions</h2>
        </div>

        <div className="divide-y">
          {prescriptions.map(([patient, medicine, dosage, doctor]) => (
            <div
              key={`${patient}-${medicine}`}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-foreground">{patient}</p>
                <p className="mt-1 text-sm text-muted-foreground">{medicine}</p>
              </div>

              <div className="text-sm text-muted-foreground sm:text-right">
                <p>{dosage}</p>
                <p className="mt-1">{doctor}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
