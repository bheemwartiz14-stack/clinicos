export function generatePatientMrn() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const entropy = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MRN-${stamp}-${entropy}`;
}
