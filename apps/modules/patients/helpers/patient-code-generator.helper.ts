export function formatPatientCode(year: number, sequence: number) {
  return `PAT-${year}-${String(sequence).padStart(4, "0")}`;
}


export function generatePatientCode() {
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `PAT-${random}`;
}
