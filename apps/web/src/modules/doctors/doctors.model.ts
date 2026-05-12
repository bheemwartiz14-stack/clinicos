import type {
  AddDoctorPageModel,
  DoctorDepartmentOption,
  DoctorListItem,
  DoctorStats,
  DoctorsPageModel,
} from "./doctors.types";

type DoctorsPageModelInput = {
  doctors: DoctorListItem[];
  stats: DoctorStats;
  query?: string;
};

export function getDoctorsPageModel({
  doctors,
  query = "",
  stats,
}: DoctorsPageModelInput): DoctorsPageModel {
  return {
    title: "Doctors",
    description: "View doctors, specialties, departments, and consultation details.",
    breadcrumb: ["Workspace", "Doctors", "View"],
    doctors,
    stats,
    query,
  };
}

export function getAddDoctorPageModel(departments: DoctorDepartmentOption[]): AddDoctorPageModel {
  return {
    title: "Add Doctor",
    description: "Create a doctor login and clinical profile linked to a department.",
    breadcrumb: ["Workspace", "Doctors", "Add Doctor"],
    departments,
  };
}
