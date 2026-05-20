type PatientSummaryInput = {
  patient: { firstName: string; lastName: string; mrn: string; allergies?: string | null; medications?: string | null };
  appointments: Array<{ startsAt: Date | string; reason: string; status: string }>;
  invoices: Array<{ balanceDue: string | number; status: string }>;
  notes: Array<{ title: string | null; body: string; noteType: string }>;
};

export function buildPatientAiSummary(input: PatientSummaryInput) {
  const recentAppointments = input.appointments.slice(0, 3).map((appointment) => `${new Date(appointment.startsAt).toLocaleDateString()}: ${appointment.reason} (${appointment.status})`);
  const pendingBalance = input.invoices.reduce((sum, invoice) => sum + Number(invoice.balanceDue || 0), 0);
  const recentNotes = input.notes.slice(0, 3).map((note) => note.title || `${note.noteType} note`);

  return [
    `AI suggestion only. ${input.patient.firstName} ${input.patient.lastName} (${input.patient.mrn}) has ${input.appointments.length} appointment record(s) in this workspace.`,
    `Allergies: ${input.patient.allergies || "none recorded"}. Current medications placeholder: ${input.patient.medications || "none recorded"}.`,
    `Recent visits: ${recentAppointments.length ? recentAppointments.join("; ") : "none recorded"}.`,
    `Pending billing balance: $${pendingBalance.toFixed(2)} across ${input.invoices.filter((invoice) => Number(invoice.balanceDue || 0) > 0).length} open invoice(s).`,
    `Recent notes: ${recentNotes.length ? recentNotes.join(", ") : "none recorded"}. Follow-up needs require doctor/admin approval before saving.`
  ].join("\n");
}

export function buildFollowupSuggestion(input: PatientSummaryInput) {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 14);
  const priority = input.appointments.some((appointment) => appointment.status === "no_show") ? "priority" : "routine";
  return {
    recommendedDate: nextDate.toISOString().slice(0, 10),
    department: "Primary Care",
    reason: "AI suggestion only: review recent appointment history, allergies, medications placeholder, and any unresolved balances before confirming follow-up.",
    priority
  };
}
