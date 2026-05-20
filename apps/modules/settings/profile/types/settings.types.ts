import type { Role } from "@mediclinic/rbac";
import type { ProfileUpdateInput } from "../validations/profile.validation";

export type SettingsProfile = {
  id: string;
  branchId: string;
  branchName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  role: Role;
  name: string;
  email: string;
  username: string | null;
  phone: string | null;
  avatar: string | null;
  gender: string | null;
  dob: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  emergencyContact: ProfileUpdateInput["emergencyContact"] | null;
  bio: string | null;
  profileVisibility: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  lastPasswordChangedAt: Date | null;
  specialty: string | null;
  licenseNumber: string | null;
  experienceYears: number | null;
  consultationFee: string | null;
};

export type SettingsOption = {
  id: string;
  name: string;
};

export type SessionRecord = {
  id: string;
  current: boolean;
  deviceName: string | null;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  location: string | null;
  userAgent: string | null;
  createdAt: Date;
  lastSeenAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
};

export type LoginHistoryRecord = {
  id: string;
  status: string;
  deviceName: string | null;
  ipAddress: string | null;
  location: string | null;
  userAgent: string | null;
  createdAt: Date;
};
