import type { PatientListItem, PatientStats, PatientsPageModel } from "./patients.types";

type PatientsPageModelInput = {
  patients: PatientListItem[];
  stats: PatientStats;
  query?: string;
  created?: boolean;
};

export function getPatientsPageModel({
  created = false,
  patients,
  query = "",
  stats,
}: PatientsPageModelInput): PatientsPageModel {
  return {
    title: "Patients",
    description: "Manage patient records, contact details, and clinical notes.",
    breadcrumb: ["Workspace", "Patients"],
    patients,
    stats,
    query,
    created,
  };
}
