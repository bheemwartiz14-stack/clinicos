import { CalendarDays, Mail, Phone, Plus, Search, Users } from "lucide-react";

const patients = [
  {
    name: "Priya Raman",
    phone: "+91 98765 43210",
    email: "priya.raman@example.com",
    status: "Follow-up",
    lastVisit: "Today",
  },
  {
    name: "Arjun Sinha",
    phone: "+91 98765 11122",
    email: "arjun.sinha@example.com",
    status: "Lab review",
    lastVisit: "Yesterday",
  },
  {
    name: "Meera Iyer",
    phone: "+91 98765 33344",
    email: "meera.iyer@example.com",
    status: "New patient",
    lastVisit: "May 6",
  },
];

export default function PatientsPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Patients</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage patient records, contact details, and visit status.
          </p>
        </div>

        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          type="button"
        >
          <Plus className="size-4" />
          Add patient
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total patients", "1,248", Users],
          ["Appointments today", "86", CalendarDays],
          ["New this week", "24", Plus],
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
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-foreground">Patient Registry</h2>
          <div className="flex h-10 items-center gap-2 rounded-lg border bg-background px-3 text-sm text-muted-foreground sm:w-72">
            <Search className="size-4" />
            <span>Search patients</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last visit</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.email} className="border-b last:border-0">
                  <td className="px-4 py-4 font-medium text-foreground">{patient.name}</td>
                  <td className="px-4 py-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="size-4" />
                      {patient.phone}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="size-4" />
                      {patient.email}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">{patient.lastVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
