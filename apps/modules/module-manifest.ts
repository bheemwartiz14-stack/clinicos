export const clinicModules = [
  "auth",
  "dashboard",
  "patients",
  "doctors",
  "appointments",
  "billing",
  "payroll",
  "notifications",
  "branches",
  "departments",
  "staff",
  "rbac",
  "settings",
  "ai",
  "reports"
] as const;

export type ClinicModule = (typeof clinicModules)[number];

export const hmvcFolders = [
  "actions",
  "controllers",
  "services",
  "repositories",
  "components",
  "views",
  "schemas",
  "validations",
  "types"
] as const;
