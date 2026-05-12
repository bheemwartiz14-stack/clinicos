export type DoctorListItem = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  specialization: string | null;
  qualification: string | null;
  experienceYears: number | null;
  consultationFee: string | null;
  licenseNumber: string | null;
  department: string | null;
  bio: string | null;
  isAvailable: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DoctorStats = {
  totalDoctors: number;
  availableDoctors: number;
  departments: number;
};

export type DoctorDepartmentOption = {
  id: string;
  name: string;
  code: string | null;
};

export type DoctorsPageSearchParams = {
  q?: string;
};

export type DoctorsPageModel = {
  title: string;
  description: string;
  breadcrumb: string[];
  doctors: DoctorListItem[];
  stats: DoctorStats;
  query: string;
};

export type AddDoctorPageModel = {
  title: string;
  description: string;
  breadcrumb: string[];
  departments: DoctorDepartmentOption[];
};

export type ActionState = {
  ok: boolean;
  message: string;
};

export type CreateDoctorInput = {
  name: string;
  email: string;
  password: string;
  emailVerified: boolean;
  image?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  departmentId: string;
  specialization: string;
  qualification?: string;
  experienceYears?: number;
  consultationFee?: string;
  licenseNumber?: string;
  bio?: string;
  isAvailable: boolean;
};
